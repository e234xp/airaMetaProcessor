const { uuid: uuidv4 } = require('uuidv4');
// const DB_FOLDER = `${global.params.dataPath}/db`;
// const QUEUE_FOLDER = `${DB_FOLDER}/runtimequeue/`;
// const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = () => {
    const { db } = global.spiderman;

    let timeoutId = -1;

    let processInterval = 500;
    let maxQueSize = 200;
    let toRowDataQue = [];

    let allAirs = [];
    let allEles = [];
    let allEnvs = [];
    let allMacs = [];
    let gateSignals = [];

    let applySettingCount = 10;

    function init(processInterval = 500, maxQueSize = 200) {
        processInterval = processInterval ? processInterval : 500;
        maxQueSize = maxQueSize ? maxQueSize : 200;

        toRowDataQue = [];

        updateSetting();

        if (timeoutId >= 0) {
            clearTimeout(timeoutId);
            timeoutId = -1;
        }

        timeoutId = setTimeout(() => {
            processLoop();
        }, 1000);
    }

    async function updateSetting() {
        return new Promise((resolve, reject) => {
            // console.log("start updateSetting");

            // 1.0 update db from deivce setting
            function updateDevice(collection, devices) {
                let _diff = [];

                try {
                    _diff = db[collection].find();
                }
                catch (ex) {
                    console.log('updateDevice', ex);
                }

                if (_diff && _diff.length >= 1) {
                    //  add/mod
                    for (let i = 0; i < _diff.length; i++) {
                        _diff[i].signal = _diff[i].signal || [];
                        _diff[i].signal.map((s) => {
                            if (s.pin) {
                                s.nin = +s.pin.replace('R', '');
                            } else {
                                s.nin = 99;
                            }
                            s.deviceId = _diff[i].deviceId;
                            return s;
                        });

                        // let found = devices.findIndex(o => o.uuid === _diff[i].uuid && o.updated_time !== _diff[i].updated_time);
                        let found = devices.findIndex(o => o.uuid === _diff[i].uuid);
                        if (found >= 0) {
                            devices[found] = _diff[i];
                        } else {
                            devices.push(_diff[i]);
                        }
                    }

                    //  del
                    for (let i = devices.length - 1; i >= 0; i--) {
                        if (_diff.findIndex(o => o.uuid === devices[i].uuid) < 0)
                            devices.splice(i, 1);
                    }
                }
            }
            updateDevice('devicesair', allAirs);
            updateDevice('devicesele', allEles);
            updateDevice('devicesenv', allEnvs);
            updateDevice('devicesmac', allMacs);

            {
                //     "uuid": "6a449024-ac74-4b2e-8824-f0a349565346",
                //     "serial": 1,
                //     "gateId": "5a443379-62cc-49aa-b80d-391f06718f16",
                //     "deviceId": "6d54394b-09e0-4ebb-9f35-a69f5c315d4a",
                //     "name": "環控設備-02",
                //     "model": "SEN1101TH",
                //     "typeId": "mac",
                //     "protocol": "modbus",
                //     "group": "A",
                //     "areaId": "A01",
                //     "locationId": "L01",
                //     "camera": [ "001", "", "", "" ],
                //     "signal": [
                //         { "pin": "R10", "state": "0>1", "light": "R", "note": "Fault", "deviceId":"1d54394b-09e0-4ebb-9f35-a69f5c315d4a" },
                //         { "pin": "R11", "state": "0>1", "light": "G", "note": "Running", "deviceId":"1d54394b-09e0-4ebb-9f35-a69f5c315d4a" }
                //     ],
                //     "created_time": 1711691464737,
                //     "updated_time": 1712044646523
            }

            // 2.0 update gate device setting
            function mergeSortByPin(deivces) {
                if (deivces.length >= 1) {
                    deivces.forEach(it => {
                        let found = gateSignals.find(o => o.gateId === it.gateId);

                        if (!found) {
                            found = { gateId: it.gateId, signal: it.signal };
                            gateSignals.push(found);
                        }

                        found.signal = found.signal.concat(
                            it.signal.filter(s =>
                                !found.signal.find(t => t.pin == s.pin)
                            )
                        );

                        found.lastUpdate = Date.now();
                    });

                    gateSignals.sort((a, b) => a.gateId - b.gateId);

                    gateSignals.map((v) => {
                        v.signal.sort((a, b) => a.nin - b.nin);
                    })
                }
            }
            mergeSortByPin(allAirs);
            mergeSortByPin(allEles);
            mergeSortByPin(allEnvs);
            mergeSortByPin(allMacs);

            {
                //     "gateId":"5a443379-62cc-49aa-b80d-391f06718f16",
                //     "signal":[
                //         {"pin":"R0","state":"0>1","light":"R","note":"Fault","nin":0,"deviceId":"1d54394b-09e0-4ebb-9f35-a69f5c315d4a"},
                //         {"pin":"R1","state":"0>1","light":"G","note":"Running","nin":1,"deviceId":"1d54394b-09e0-4ebb-9f35-a69f5c315d4a"},
                //         {"pin":"R2","state":"0>1","light":"R","note":"Fault","nin":2,"deviceId":"2d54394b-09e0-4ebb-9f35-a69f5c315d4a"},
                //         ...
            }
            // console.log('updateSetting gateSignals', gateSignals);

            // console.log("end updateSetting");
            resolve(true);
        })
    }

    function pushTask(data) {
        if (toRowDataQue.length >= maxQueSize) return null;

        const procUuid = uuidv4();
        data.proc_uuid = procUuid;

        // console.log("pushTask", toRowDataQue.length, data);
        toRowDataQue.push(data);

        return procUuid;
    }

    // [
    //     {
    //         "gateId": "2a443379-62cc-49aa-b80d-391f06718f17",
    //         "topic": "GW-001/RM16-001",
    //         "signal": { "DI0": 0, "DI1": 1, "DI2": 0, "DI3": 0, "DI4": 0, "DI5": 0, "DI6": 0, "DI7": 0, "DI8": 0, "DI9": 0, "DI10": 0, "DI11": 0, "DI12": 0, "DI13": 0, "DI14": 0, "DI15": 0 },
    //         "data": { "DI0": 0, "DI1": 1, "DI2": 0, "DI3": 0, "DI4": 0, "DI5": 0, "DI6": 0, "DI7": 0, "DI8": 0, "DI9": 0, "DI10": 0, "DI11": 0, "DI12": 0, "DI13": 0, "DI14": 0, "DI15": 0 },
    //     }
    // ]


    async function processLoop() {
        while (true) {
            while (toRowDataQue.length > 0) {
                let item = toRowDataQue.shift();

                let reqData = undefined;
                try {
                    reqData = JSON.parse(item);
                }
                catch (ex) { reqData = undefined; }

                if (reqData !== undefined) {
                    // update setting every looping 10 times
                    applySettingCount--;
                    if (applySettingCount <= 0) {
                        await updateSetting();
                        applySettingCount = 10;
                    }
                    // store gate status and change
                    // {
                    //     "_id": "6615fb71d78157413cba62a1",
                    //     "gateId":"2a443379-62cc-49aa-b80d-391f06718f17"
                    //     "topic": "GW-001/RM16-001",
                    //     "time": 1712716657493,
                    //     "datetime": "4/10/2024, 10:37:37 AM",
                    //     "message": { "DI0": 0, "DI1": 1, "DI2": 0, "DI3": 0, "DI4": 0, "DI5": 0, "DI6": 0, "DI7": 0, "DI8": 0, "DI9": 0, "DI10": 0, "DI11": 0, "DI12": 0, "DI13": 0, "DI14": 0, "DI15": 0 },
                    //     "lastModifiedDate": "2024-04-10T02:37:37.493Z"
                    // }

                    DeviceRowMeta(reqData);
                }
                await delay(processInterval);
            }

            await delay(processInterval);
        }
    }

    let devicesStatus = [];
    function DeviceRowMeta(record) {
        {
            //     "_id": "6615fb71d78157413cba62a1",
            //     "gateId":"2a443379-62cc-49aa-b80d-391f06718f17"
            //     "topic": "GW-001/RM16-001",
            //     "time": 1712716657493,
            //     "datetime": "4/10/2024, 10:37:37 AM",
            //     "message": { "DI0": 0, "DI1": 1, "DI2": 0, "DI3": 0, "DI4": 0, "DI5": 0, "DI6": 0, "DI7": 0, "DI8": 0, "DI9": 0, "DI10": 0, "DI11": 0, "DI12": 0, "DI13": 0, "DI14": 0, "DI15": 0 },
            //     "lastModifiedDate": "2024-04-10T02:37:37.493Z"
        }

        // let settingGate = gateSignals.find(o => o.gateId === record.gateId && o.topic === record.topic);
        let settingGate = gateSignals.find(o => o.gateId === record.gateId);
        let settingSignal = settingGate ? settingGate.signal : [];

        // console.log("settingSignal", settingSignal);
        {
            // pin: 'R0',
            // state: '0>1',
            // light: 'R',
            // note: 'Fault',
            // nin: 0,
            // deviceId: '1d54394b-09e0-4ebb-9f35-a69f5c315d4a'
        }

        // console.log("reqData", record);

        // for(var key in record.message) {
        //     console.log("aaa", i, record.message[key], record.message[key] );
        // }

        let devSignal = [];
        for (let i = 0; i < settingSignal.length; i++) {
            const deviceId = settingSignal[i].deviceId;

            let found = devSignal.find(o => o.deviceId === settingSignal[i].deviceId);

            if (settingSignal[i].state) {
                if (found) {
                    if (settingSignal[i].state.search(`>${record.message[`DI${settingSignal[i].pin.replace('R', '')}`]}`) >= 0) {
                        found.points.push(settingSignal[i].light);
                    }
                } else {
                    if (settingSignal[i].state.search(`>${record.message[`DI${settingSignal[i].pin.replace('R', '')}`]}`) >= 0) {
                        devSignal.push({ deviceId, points: [settingSignal[i].light] });
                    }
                }
            }
        }

        let time = new Date().valueOf();
        for (let i = 0; i < devSignal.length; i++) {
            global.domain.workerMongo.insertOne(
                'DeviceRowMeta',
                {
                    gateId: record.gateId,
                    topic: record.topic,
                    timestamp: time,
                    datetime: new Date(time).toLocaleString(),
                    deviceId: devSignal[i].deviceId,
                    data: devSignal[i].points.join('')
                },
                (err, data) => {
                    if (err)
                        console.log("DeviceRowMeta", err) ;
                    else {
                        if (data) {
                            data.forEach((record) => {
                                DeviceEventStat(record);
                            });
                        }
                    }
                }

            )
        }
    }

    function DeviceEventStat(record) {
        let funIdx = devicesStatus.findIndex(o => o.deviceId === record.deviceId);

        let date = new Date(record.timestamp);
        let dateCode = `${date.getFullYear()}${('00' + (date.getMonth() + 1)).slice(-2)}${('00' + date.getDate()).slice(-2)}`;

        if (funIdx >= 0) {
            let dateToUpdate = devicesStatus[funIdx];

            if (dateToUpdate.eventData.length >= 1) {
                // diff data update last end_time duration and add new one
                if (dateToUpdate.eventData[dateToUpdate.eventData.length - 1].data !== record.data) {
                    dateToUpdate.eventData[dateToUpdate.eventData.length - 1].end_time = record.timestamp;
                }
            }

            if (dateToUpdate.statData.length >= 1) {
                // diff data update last end_time duration and add new one
                if (dateToUpdate.statData[dateToUpdate.statData.length - 1].data !== record.data) {
                    dateToUpdate.statData[dateToUpdate.statData.length - 1].duration +=
                        dateToUpdate.eventData[dateToUpdate.eventData.length - 1].end_time -
                        dateToUpdate.eventData[dateToUpdate.eventData.length - 1].start_time;
                }
            }

            // the same dateCode push new event object
            if (dateCode === dateToUpdate.dateCode) {
                if (dateToUpdate.eventData.length >= 1) {
                    dateToUpdate.eventData.push({ start_time: record.timestamp, end_time: -1, data: record.data });
                }

                if (dateToUpdate.statData.length >= 1) {
                    let cnt = 0;
                    let idx = dateToUpdate.statData.findIndex((st) => st.data == record.data);
                    if (idx >= 0) {
                        dateToUpdate.statData[idx].count += 1;
                        dateToUpdate.statData.push(dateToUpdate.statData.splice(idx, 1)[0]);
                    } else {
                        dateToUpdate.statData.push({ count: cnt + 1, duration: -1, data: record.data });
                    }

                }

                // update last end_time and duration
                global.domain.workerMongo.updateOne(
                    'DeviceRowEventStat',
                    dateToUpdate,
                    { dateCode: dateToUpdate.dateCode, deviceId: dateToUpdate.deviceId },
                    (err, doc) => {
                        if (err) console.log("DeviceEventStat", err) ;
                        // console.log("bbb", JSON.stringify(doc));
                    }
                );
            } else {
                // diff dateCode
                // update last end_time and duration
                global.domain.workerMongo.updateOne(
                    'DeviceRowEventStat',
                    dateToUpdate,
                    { dateCode: dateToUpdate.dateCode, deviceId: dateToUpdate.deviceId },
                    (err, doc) => {
                        if (err) console.log("DeviceEventStat", err) ;
                        // console.log("bbb", JSON.stringify(doc));
                    }
                );

                let dateToUpdate = {
                    dateCode: `${date.getFullYear()}${('00' + (date.getMonth() + 1)).slice(-2)}${('00' + date.getDate()).slice(-2)}`,
                    deviceId: record.deviceId,
                    eventData: [{ start_time: record.timestamp, end_time: -1, data: record.data }],
                    statData: [{ count: 1, duration: -1, data: record.data }]
                }

                devicesStatus.push(dateToUpdate);

                global.domain.workerMongo.updateOne(
                    'DeviceRowEventStat',
                    dateToUpdate,
                    { dateCode: dateToUpdate.dateCode, deviceId: dateToUpdate.deviceId },
                    (err, doc) => {
                        if (err) console.log("DeviceEventStat", err) ;
                        // console.log("bbb", doc) ;
                    }
                );
            }
        } else {
            let dateToUpdate = {
                dateCode: `${date.getFullYear()}${('00' + (date.getMonth() + 1)).slice(-2)}${('00' + date.getDate()).slice(-2)}`,
                deviceId: record.deviceId,
                eventData: [{ start_time: record.timestamp, end_time: -1, data: record.data }],
                statData: [{ count: 1, duration: -1, data: record.data }]
            }

            devicesStatus.push(dateToUpdate);

            global.domain.workerMongo.updateOne(
                'DeviceRowEventStat',
                dateToUpdate,
                { dateCode: dateToUpdate.dateCode, deviceId: dateToUpdate.deviceId },
                (err, doc) => {
                    if (err) console.log("DeviceEventStat", err) ;
                    // console.log("bbb", doc) ;
                }
            );
        }
    }

    return {
        init,
        pushTask,
    };
};

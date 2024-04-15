module.exports = () => {
  function init() {
    let receivePort = global.params.server.dataPort || 5552;

    if (global.params.server.dataEnable) {
      const server = global.spiderman.udp.create();

      server.on('listening', () => {
        const address = server.address();
        global.spiderman.systemlog.writeInfo(`domain worker-demographic listening ${address.address}:${address.port}`);

        console.log(`接收伺服器正在監聽 worker-demographic ${address.address}:${address.port}`);
      });

      server.on('message', (message, rinfo) => {
        try {
          console.log('==============================================================');
          console.log(`message from demographic ${rinfo.address} ${rinfo.port}`);
          global.spiderman.systemlog.writeInfo(`domain worker-demographic message ${rinfo.address} ${rinfo.port}`);

          var pos = 0;
          // var totalLen = Number(message.readUInt32LE(pos));
          // pos += 4;
          // //console.log( "totalLen ", totalLen );

          // var timeLen = Number(message.readUInt32LE(pos));
          // pos += 4;
          // //console.log( "timeLen ", timeLen );
          // var time = Number(message.readBigUInt64LE(pos));
          // pos += timeLen;

          // //console.log( "time ", time );

          // var sourceUuidLen = Number(message.readUInt32LE(pos));
          // pos += 4;
          // //console.log( "sourceUuidLen ", sourceUuidLen );
          // var sourceUuid = message.toString('utf8', pos, pos + sourceUuidLen);
          // pos += sourceUuidLen;

          // //console.log( "sourceUuid ", sourceUuid );

          // var algorithmLen = Number(message.readUInt32LE(pos));
          // pos += 4;
          // //console.log( "algorithmLen ", algorithmLen );
          // var algorithm = message.toString('utf8', pos, pos + algorithmLen);
          // pos += algorithmLen;

          // var algorithmUuidLen = Number(message.readUInt32LE(pos));
          // pos += 4;
          // //console.log( "algorithmUuidLen ", algorithmUuidLen );
          // var algorithmUuid = message.toString('utf8', pos, pos + algorithmUuidLen);
          // pos += algorithmUuidLen;

          // //console.log( "algorithmUuid ", algorithmUuid );
          // //console.log( "algorithm ", algorithm );

          var infoLen = Number(message.readUInt32LE(pos));
          pos += 4;

          //console.log( "infoLen ", infoLen );
          var info = message.toString('utf8', pos, pos + infoLen);
          pos += infoLen;
          message = JSON.parse(info);

          // message = {
          //   timestamp: time,
          //   source_uuid: sourceUuid,
          //   algorithm_uuid: algorithmUuid,
          //   algorithm: algorithm,
          //   data_objects: JSON.parse(info)
          // };
          console.log("data : ", message);

          let timestamp = new Date().valueOf();

          global.domain.workerMongo.insertOne(
            'DeviceRow',
            { topic: rinfo.address, time: timestamp, datetime: new Date(timestamp).toLocaleString(), message: message },
            (err, data) => {
              if (data) {
                data.forEach((record) => {
                  console.log('demographic workder onData', record);



                  // global.spiderman.socket.broadcastMessage({
                  //   socketServer: global.spiderman.server.wsDeviceStatus,
                  //   message: JSON.stringify(record)
                  // });
                });
              }
            }
          )
        } catch (e) {
          console.log('domain worker-demographic message', e);
        }
      });

      server.bind(receivePort);
    }
  }

  return {
    init,
  };
};

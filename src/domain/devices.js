module.exports = (deviceType) => {
  const { db } = global.spiderman;

  let collection = "";
  
  switch (deviceType) {
    case "mac":
      collection = "devicesmac";
      break;
    case "air":
      collection = "devicesair";
      break;
    case "ele":
      collection = "devicesele";
      break;
    case "env":
      collection = "devicesenv";
      break;
    case "gate":
      collection = "devicesgate";
      break;
    case "comm":
      collection = "devicescomm";
      break;
    default:
      collection = "devicesenv";
      break;
  }

  async function find({
    uuid, deviceId, sliceShift, sliceLength
  }) {
    if (!Array.isArray(uuid)) uuid = [];
    if (!Array.isArray(deviceId)) deviceId = [];
    if (sliceShift == undefined) sliceShift = 0;
    if (sliceLength == undefined) sliceLength = 100;

    global.spiderman.systemlog.writeInfo(`domain ${collection} find ${uuid} ${deviceId}`);

    const { totalLength, result } = await global.domain.crud
      .find({
        collection: collection,
        query: { uuid: (uuid.length <= 0 ? {} : { $in: uuid }), deviceId: (deviceId.length <= 0 ? {} : { $in: deviceId }) },
        sliceShift,
        sliceLength,
      });

    return {
      total_length: totalLength,
      slice_shift: sliceShift,
      slice_length: sliceLength,
      list: result
    };
  }

  async function create(data) {
    global.spiderman.systemlog.writeInfo(`domain ${collection} create ${data.deviceId} ${data.name}`);

    let doesExist = false;
    doesExist = !!db[collection].findOne({ uuid: data.uuid });
    if (doesExist) throw Error(`The item <${data.uuid}> has already existed.`);

    doesExist = !!db[collection].findOne({ name: data.name });
    if (doesExist) throw Error(`The item <${data.name}> has already existed.`);

    const typeId = !!db.devicetype.findOne({ typeId: data.typeId });
    if (!typeId) throw Error(`The item <${data.typeId}> does not existed.`);

    await global.domain.crud.insertOne({
      collection: collection,
      data,
    });
  }

  async function modify(data) {
    global.spiderman.systemlog.writeInfo(`domain ${collection} modify ${data.uuid}`);

    // const fixedUuids = ['0', '1'];
    // if (fixedUuids.includes(data.uuid)) throw Error('The item can not be change.');

    let doesExist = false;
    doesExist = !!db[collection].findOne({ deviceId: data.deviceId, uuid: { $ne: data.uuid } });
    if (doesExist) throw Error(`The item <${data.deviceId}> has already existed.`);

    doesExist = !!db[collection].findOne({ name: data.name, uuid: { $ne: data.uuid } });
    if (doesExist) throw Error(`The item <${data.name}> has already existed.`);

    const typeId = !!db.devicetype.findOne({ typeId: data.typeId });
    if (!typeId) throw Error(`The item <${data.typeId}> does not existed.`);

    await global.domain.crud.modify({
      collection: collection,
      uuid: data.uuid,
      data,
    });
  }

  async function remove({
    uuid
  }) {
    if (!Array.isArray(uuid)) uuid = [];
    if (uuid.length <= 0)
      throw Error('uuid cannot be an empty array.')

    global.spiderman.systemlog.writeInfo(`domain ${collection} remove ${uuid}`);

    // const fixedUuids = ['0', '1'];
    // uuid = uuid.filter((item) => !fixedUuids.includes(item));

    db[collection].deleteMany(
      { uuid: { $in: uuid } }
    );
  }

  return {
    find,
    create,
    modify,
    remove,
  };
};

module.exports = () => {
  const { db } = global.spiderman;

  async function find({
    uuid, sliceShift, sliceLength
  }) {
    if (!Array.isArray(uuid)) uuid = [];
    if (sliceShift == undefined) sliceShift = 0;
    if (sliceLength == undefined) sliceLength = Number.MAX_SAFE_INTEGER;

    global.spiderman.systemlog.writeInfo(`domain devicegroup find ${uuid}`);

    const { totalLength, result } = await global.domain.crud
      .find({
        collection: 'devicegroup',
        query: { uuid: (uuid.length <= 0 ? {} : { $in: uuid }) },
        sliceShift,
        sliceLength,
      });

    return {
      total_length: totalLength,
      list: result
    };
  }

  async function create({
    typeId, name, remark,
  }) {
    global.spiderman.systemlog.writeInfo(`domain devicegroup create ${typeId} ${name}`);

    // const fixedUuids = ['1', '2', '3', '4'];
    // if (fixedUuids.includes(uuid)) throw Error('The item can not be change.');

    let doesExist = false;
    // doesExist = !!db.devicegroup.findOne({ typeId });
    // if (doesExist) throw Error(`The item <${typeId}> has already existed.`);

    doesExist = !!db.devicegroup.findOne({ name });
    if (doesExist) throw Error(`The item <${name}> has already existed.`);

    await global.domain.crud.insertOne({
      collection: 'devicegroup',
      data: { name, remark },
    });
  }

  async function modify({
    uuid,
    typeId, name, remark,
  }) {
    global.spiderman.systemlog.writeInfo(`domain devicegroup modify ${uuid}`);

    // const fixedUuids = ['1', '2', '3', '4'];
    // if (fixedUuids.includes(uuid)) throw Error('The item can not be change.');

    let doesExist = false;
    // doesExist = !!db.devicegroup.findOne({ typeId, uuid: { $ne: uuid } });
    // if (doesExist) throw Error(`The item <${typeId}> has already existed.`);

    doesExist = !!db.devicegroup.findOne({ name, uuid: { $ne: uuid } });
    if (doesExist) throw Error(`The item <${name}> has already existed.`);

    await global.domain.crud.modify({
      collection: 'devicegroup',
      uuid,
      data: { name, remark },
    });
  }

  async function remove({
    uuid
  }) {
    if (!Array.isArray(uuid)) uuid = [];
    if (uuid.length <= 0)
      throw Error('uuid cannot be an empty array.')

    global.spiderman.systemlog.writeInfo(`domain , typeId remove ${uuid}`);

    // const fixedUuids = ['0', '1'];
    // uuid = uuid.filter((item) => !fixedUuids.includes(item));

    db.devicegroup.deleteMany(
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

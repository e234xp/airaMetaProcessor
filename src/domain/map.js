module.exports = (deviceType) => {
  const { db } = global.spiderman;

  async function find({
    uuid, sliceShift, sliceLength
  }) {
    if (!Array.isArray(uuid)) uuid = [];
    if (sliceShift == undefined) sliceShift = 0;
    if (sliceLength == undefined) sliceLength = 100;

    global.spiderman.systemlog.writeInfo(`domain map find ${uuid}`);

    const { totalLength, result } = await global.domain.crud
      .find({
        collection: 'map',
        query: { uuid: (uuid.length <= 0 ? {} : { $in: uuid }) },
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
    global.spiderman.systemlog.writeInfo(`domain map create ${data.name}`);

    let doesExist = false;
    doesExist = !!db.map.findOne({ uuid: data.uuid });
    if (doesExist) throw Error(`The item <${data.uuid}> has already existed.`);

    await global.domain.crud.insertOne({
      collection: 'map',
      data,
    });
  }

  async function modify(data) {
    global.spiderman.systemlog.writeInfo(`domain map modify ${data.uuid}`);

    // const fixedUuids = ['0', '1'];
    // if (fixedUuids.includes(data.uuid)) throw Error('The item can not be change.');

    await global.domain.crud.modify({
      collection: 'map',
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

    global.spiderman.systemlog.writeInfo(`domain map remove ${uuid}`);

    // const fixedUuids = ['0', '1'];
    // uuid = uuid.filter((item) => !fixedUuids.includes(item));

    db.map.deleteMany(
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

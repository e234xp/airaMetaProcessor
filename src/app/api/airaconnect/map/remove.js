const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: false,
  }
];

module.exports = async (data) => {
  global.spiderman.systemlog.writeInfo(`devicesenv remove ${data.uuid}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  await global.domain.map.remove(data);

  return {
    message: 'ok',
  };
};

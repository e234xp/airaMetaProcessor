module.exports = {
  init: () => {
    const instance = {
      crud: require('./crud')(),
      
      devicetype: require('./devicetype')(),
      devicegroup: require('./devicegroup')(),
      devicesenv: require('./devices')('env'),
      devicesmac: require('./devices')('mac'),
      devicesair: require('./devices')('air'),
      devicesele: require('./devices')('ele'),
      devicesgate: require('./devices')('gate'),
      devicescomm: require('./devices')('comm'),
      map: require('./map')(),
      report: require('./report')(),

      // eventhandle: require('./eventhandle')(),

      workerMongo: require('./worker-mongo')(),
      workerMsgServer: require('./worker-msgserver')(),
      workerMsgSender: require('./worker-msgsender')(),
      
      // workerFriendtrolGateway: require('./worker-friendtrol-gateway')(),
      // workerIOTRouter: require('./worker-iotrouter')(),
      // workerNx: require('./worker-nx')(),
      workerDataProcesser: require('./worker-dataprocesser')(),

      // initdb: require('./initdb')(),
    };

    return instance;
  },
};

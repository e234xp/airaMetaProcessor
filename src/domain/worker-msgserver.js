module.exports = () => {
  let server = null;
  let metaHost = "0.0.0.0";
  let metaPort = 2234;

  function init() {
    console.log("worker-msgserver init start");

    server = global.spiderman.udpserver.createServer({
      host: metaHost,
      port: metaPort,
      onReadly: (server) => {
        console.log("worker-msgserver onReadly");

      },
      onConnect: (server) => {
        console.log("worker-msgserver onConnect");

      },
      onData: (socket, data) => {
        // console.log("worker-msgserver onData");

        global.domain.workerDataProcesser.pushTask(data.toString());
      },

      onClose: () => {
        console.log("worker-msgserver onClose");
      },
      onError: () => {
        console.log("worker-msgserver onError");
      }
    });

    console.log("worker-msgserver init end");
  }

  return {
    init,
  };
}

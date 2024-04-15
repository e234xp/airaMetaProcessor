module.exports = () => {
  let expressClient = null;
  let expressHost = "localhost";
  let expressPort = 6551;

  let metaClient = null;
  let metaHost = "localhost";
  let metaPort = 7551;


  function init() {
    console.log(`worker-msgsender init start`);
    expressClient = global.spiderman.udp.create();
    metaClient = global.spiderman.udp.create();
    console.log(`worker-msgsender init end`);
  }

  function send(data) {
    expressClient.send(
      data
      , 0
      , data.length
      , expressPort
      , expressHost
      , (err, bytes) => {
        console.log(`worker-msgsender to ${expressHost} ${expressPort}`, err, bytes);
      }
    );

    metaClient.send(
      data
      , 0
      , data.length
      , metaPort
      , metaHost
      , (err, bytes) => {
        console.log(`worker-msgsender to ${metaHost} ${metaPort}`, err, bytes);
      }
    );
  }

  return {
    init,
    send,
  };
};

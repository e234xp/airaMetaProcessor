const exec = require('child_process').exec;

function execute(command, callback) {
  exec(command, function (error, stdout, stderr) {
    if (stderr)
      callback(stderr);
    else
      callback(stdout);
  });
}

module.exports = async () => {
  global.spiderman.systemlog.writeInfo('systemsettings timezonelist');

  let zones = [];

  await new Promise((resolve, reject) => {
    execute('ZONES="$(timedatectl list-timezones)"\n for ZONE in $ZONES\n do\n OFFSET="$(env TZ=${ZONE} date +%:z)"\n echo "$ZONE $OFFSET"\n done', function (callback) {
      let lines = callback.split('\n');
      for (var i = 0; i < lines.length; i++) {
        let tz = lines[i].trim();

        if (tz != "") {
          // "Africa/Abidjan +00:00"
          var spt = tz.split(' ');

          if (spt[0].trim().slice(0, 3) != 'Etc') {
            zones.push(
              {
                zone: spt[0].trim(),
                offset: spt[1].trim()
              }
            );
          }
        }
      }
      resolve(null);
    });
  });

  zones.sort((a, b) => {
    if (Number(a.offset.slice(0, 3)) < Number(b.offset.slice(0, 3)))
      return -1;
    if (Number(a.offset.slice(0, 3)) > Number(b.offset.slice(0, 3)))
      return 1;
    return 0;
  });

  const ret = {
    message: 'ok',
    data_list: zones,
  };

  global.spiderman.systemlog.writeInfo(`systemsettings timezonelist ${JSON.stringify(ret)}`);

  return ret;
};

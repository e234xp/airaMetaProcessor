const fs = require('fs');
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
  global.spiderman.systemlog.writeInfo('systemsettings getdatetime');

  const self = this;

  self.timezone_path = '/etc/timezone';
  self.ntpserver_path = '/etc/systemd/timesyncd.conf';

  let timezone = "";
  if (fs.existsSync(self.timezone_path))
    timezone = fs.readFileSync(self.timezone_path, { encoding: 'utf-8' }).replace('\n', '').trim();

  let lines = [];
  let ntp_enable = false;
  await new Promise((resolve, reject) => {
    execute('timedatectl', function (callback) {
      lines = callback.split('\n');

      for (var i = 0; i < lines.length; i++) {
        var tmp = (lines[i].trim() + ':').split(":");

        if (tmp[0] == 'NTP service')
          ntp_enable = tmp[1].trim() == "active" ? true : false;
      }

      resolve(null);
    });
  });

  let ntp_servername = '';
  await new Promise((resolve, reject) => {
    lines = [];
    if (fs.existsSync(self.ntpserver_path)) {
      lines = fs.readFileSync(self.ntpserver_path, { encoding: 'utf-8' }).split('\n');
      for (var i = 0; i < lines.length; i++) {
        var tmp = lines[i].trim();

        if (tmp[0] != '#') {
          tmp = (lines[i].trim() + '=').split("=");

          if (tmp[0].trim() == 'NTP')
            ntp_servername = tmp[1].trim();
        }
      }
    }
    resolve(null);
  });

  let datetime = new Date().getTime();

  let result = {
    time_zone: timezone,
    enable_auto_time: ntp_enable,
    ntp_server: ntp_servername,
    timestamp: datetime
  };

  const ret = {
    message: 'ok',
    settings: result,
  };

  global.spiderman.systemlog.writeInfo(`systemsettings getdatetime ${JSON.stringify(ret)}`);

  return ret;
};

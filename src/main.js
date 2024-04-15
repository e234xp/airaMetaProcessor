process.env.UV_THREADPOOL_SIZE = 128;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 引入 .env
require('dotenv').config();

const fs = require('fs');
const path = require('path');

let serverprofile = require('./spiderman/defaultdata/serverprofile');

const argObject = (() => {
  const result = {};

  process.argv.forEach((a, index) => {
    const isValid = index > 1;
    if (!isValid) return;

    const [key, value] = a.split('=');

    result[key] = value;
  });

  return result;
})();

global.params = generateParams(argObject);
function generateParams({
  fileroot = path.dirname(fs.realpathSync(process.mainModule.filename)),
  localhost = '127.0.0.1:8088'
}) {
  const dataPath = `${fileroot}/data`;
  const swPath = `${fileroot}/sw`;
  const fwPath = `${fileroot}/fw`;
  const importPath = `${fileroot}/import`;
  const wwwdist = `${fileroot}/wwwdist`;

  try {
    serverprofile = JSON.parse(fs.readFileSync(`${dataPath}/db/serverprofile.db`, 'utf8'));
  }
  catch (ex) { console.log(ex.message) }

  return {
    ...{ fileroot, localhost, dataPath, swPath, fwPath, importPath, wwwdist },
    ...serverprofile
  };
}

const spiderman = require('./spiderman/index');
const domain = require('./domain/index');
// const runtimcache = require('./runtimcache/index');

global.spiderman = spiderman.init();

process.on('uncaughtException', (err) => {
  console.log('system UCE : ', err);
});

global.domain = domain.init();
// global.domain.initdb.init();

require('./app/init')();
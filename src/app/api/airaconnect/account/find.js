const fieldChecks = [
];

module.exports = (data, token) => {
  global.spiderman.systemlog.writeInfo(`account find ${JSON.stringify(data)}`);

  // paramters checker
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  // optional paramters set default value

  //  ===================================
  const accounts = (() => {
    const accountsTmp = global.spiderman.db.account.find();
    const tokenUser = global.spiderman.token.decryptToAccount(token);

    return tokenUser.x === 'Admin'
      ? accountsTmp
      : accountsTmp.filter((d) => tokenUser.u === d.username);
  })();

  const ret = {
    message: 'ok',
    account_list: accounts,
  };

  global.spiderman.systemlog.writeInfo(`account find ${JSON.stringify(ret)}`);

  return ret;
};

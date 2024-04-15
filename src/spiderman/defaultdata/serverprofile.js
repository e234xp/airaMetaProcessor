module.exports = {
    server: {
        httpEnable: true,
        httpPort: 8087,
        httpsEnable: true,
        httpsPort: 8447,
        prefix: "airaconnect",
    },
    session: {
        checkTimer: 5000,
        timeOut: 3600000,
        godSession: "83522758",
    },
    mongodb: {
        ip: "127.0.0.1",
        port: 27017,
        user: "",
        pass: "",
        db: "airaConnect",
    },
    vms: {
        host: "192.168.10.162",
        port: 7002,
        username: "rtsp",
        password: "Az123456",
        server_id: "8ea4b96c-9c45-577e-12ff-29ce52ec226d",
        authorization: "basic"
    },
    smtp: {
        enable: false,
        host: "smtp.gmail.com",
        port: "587",
        security: "TLS",
        account: "xxxxxxx@aira.com.tw",
        password: "",
        sender: "airaTrack Sender",
        email: "sales@aira.com.tw"
    },
    create_date: Date.now(),
    last_modify_date: Date.now(),
};

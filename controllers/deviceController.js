const mqtt = require("mqtt");
const broker = "mqtt://broker.hivemq.com:1883";
const topic = "/control_IOT";
const Device = require("../models/Devices");
const options = {};
const client = mqtt.connect(broker, options);
const Room = require("../models/Rooms");
const Account = require("../models/Accounts");

const deviceController = {
    // getData: async (req, res) => {
    //     try {
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Get Data success",
    //             value: value,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error",
    //             error: err,
    //         });
    //     }
    // },

    // controlDevice: async (req, res) => {
    //     try {
    //         const { deviceId, ...control } = req.body;

    //         console.log("deviceid: ", deviceId);
    //         console.log("control: ", control.control);
    //         await Devices.findByIdAndUpdate(deviceId, {
    //             control: { ...control.control },
    //         });
    //         // client.on('connect', () => {
    //         // console.log('Connected broker')
    //         client.publish(
    //             topic,
    //             JSON.stringify({
    //                 deviceId: deviceId,
    //                 control: { ...control.control },
    //             }),
    //             (err) => {
    //                 if (err) console.log("MQTT publish error: ", err);
    //                 else console.log("Published!");
    //             }
    //         );
    //         // })
    //         console.log(control);
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Send control signal success!",
    //             control: control.control,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error!",
    //             error: err,
    //         });
    //     }
    // },
    // getDeviceData: async (req, res) => {
    //     try {
    //         const deviceId = req.params.deviceId;
    //         const device = await Devices.findById(deviceId);
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Get device info success!",
    //             deviceInfo: {
    //                 deviceName: device.deviceName,
    //                 deviceType: device.deviceType,
    //                 control: device.control,
    //             },
    //         });
    //     } catch (err) {
    //         res.status(404).json({
    //             status: "ERR",
    //             msg: "Something wrong on server",
    //             error: err,
    //         });
    //     }
    // },

    // createDevice: async (req, res) => {
    //     try {
    //         const { deviceInfo, roomId } = req.body;
    //         const device = new Devices(deviceInfo);
    //         await device.save();
    //         await Room.findByIdAndUpdate(roomId, {
    //             $push: {
    //                 devices: device._id,
    //             },
    //         });
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Create new device success!",
    //             deviceId: device._id,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error",
    //             error: err,
    //         });
    //     }
    // },
    createDevice: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: th??ng tin m???i c???a thi???t b??? {roomId, deviceName, deviceType}
            const deviceInfo = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            // Th??m thi???t b??? m???i
            const newDevice = new Device(deviceInfo);

            await newDevice.save();

            // Th??m th??ng tin thi???t b??? m???i v??o devicesList c???a ph??ng n??y
            await Room.findByIdAndUpdate(newDevice.roomId, {
                $addToSet: {
                    devicesList: {
                        _id: newDevice._id,
                        deviceName: newDevice.deviceName,
                    },
                },
            });

            //Tr??? v??? th??ng tin thi???t b??? m???i th??m
            return res.send({
                result: "success",
                device: newDevice,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDeviceData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: deviceId
            const { deviceId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            const deviceData = await Device.findById(deviceId);
            // Tr??? v??? d??? li???u thi???t b???
            return res.send({
                result: "success",
                deviceData: deviceData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    updateDeviceData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: id thi???t b???, t??n m???i c???a thi???t b???, id ph??ng mu???n ?????i
            const { deviceId, newName, newRoomId } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            const deviceInfo = await Device.findById(deviceId);

            // X??a th??ng tin thi???t b??? kh???i devicesList c???a ph??ng tr?????c ????
            await Room.updateOne(
                { _id: deviceInfo.roomId },
                {
                    $pull: {
                        devicesList: { _id: deviceId },
                    },
                }
            );

            // C???p nh???t th??ng tin m???i c???a thi???t b???
            const newDevice = await Device.findByIdAndUpdate(deviceId, {
                deviceName: newName,
                roomId: newRoomId,
            });

            // Th??m th??ng tin thi???t b??? ??? devicesList c???a ph??ng m???i ?????i
            await Room.findByIdAndUpdate(newRoomId, {
                $addToSet: {
                    devicesList: {
                        _id: deviceInfo._id,
                        deviceName: newName,
                    },
                },
            });

            await newDevice.save();

            return res.send({
                result: "success",
                message: "C???p nh???t th??nh c??ng",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDevicesListOfRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: roomId
            const { roomId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            const devicesList = await Device.find({ roomId: roomId });
            return res.send({
                result: "success",
                devicesListOfRoom: devicesList,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
    
    getDevicesListOfHome: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: homeId
            const { homeId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            const roomsList = await Room.find({ homeId: homeId });
            let devicesList = [];
            for (let i = 0; i < roomsList.length; i++) {
                devicesList = devicesList.concat(
                    await Device.find({ roomId: roomsList[i]._id })
                );
            }

            // Tr??? v??? danh s??ch c??c thi???t b???
            return res.send({
                result: "success",
                devicesListOfHome: devicesList,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    deleteDevice: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: Id c???a thi???t b??? b??? x??a
            const { deviceId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }
            const deviceInfo = await Device.findById(deviceId);

            // X??a th??ng tin thi???t b??? kh???i devicesList c???a ph??ng ????
            await Room.updateOne(
                { _id: deviceInfo.roomId },
                {
                    $pull: {
                        devicesList: { _id: deviceId },
                    },
                }
            );

            // X??a thi???t b??? kh???i database
            await Device.findByIdAndDelete(deviceId);

            //Th??ng b??o th??nh c??ng
            return res.send({
                result: "success",
                message: "X??a thi???t b??? th??nh c??ng",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
    updateData: async (data) => {
        try {
            const device = await Device.findByIdAndUpdate(data.deviceId, {
                    data: data.data,
            });
        } catch (err) {
            console.log(err);
        }
    },
    controlDevice: async (req, res) => {
        try {
            const { deviceId, ...control } = req.body;

            console.log("deviceid: ", deviceId);
            console.log("control: ", control.control);
            const currentDevice = await Device.findByIdAndUpdate(deviceId, {
                control: { ...control.control },
            });
            // client.on('connect', () => {
            // console.log('Connected broker')
            client.publish(
                topic,
                JSON.stringify({
                    deviceId: deviceId,
                    control: { ...control.control },
                }),
                (err) => {
                    if (err) console.log("MQTT publish error: ", err);
                    else console.log("Published!");
                }
            );
            // })
            console.log(control);
            res.status(200).json({
                status: "OK",
                msg: "Send control signal success!",
                currentDevice: currentDevice,
            });
        } catch (err) {
            res.status(500).json({
                status: "ERR",
                msg: "Server Error!",
                error: err,
            });
        }
    },
    getTemperature: async (req, res) => {
        try {
            const { deviceId } = req.query;
            var data;
            const deviceData = await Device.findById(deviceId);
            console.log(deviceData);
            if (deviceData.deviceType === "C???m bi???n nhi???t ?????") {
                // value = device.value[device.value.length - 1];
                data = deviceData.data;
            }
                console.log(data);
            
            res.status(200).json({
                status: "OK",
                msg: "Get room temperature success",
                temperature: data,
            });
        } catch (err) {
            res.status(500).json({
                status: "ERR",
                msg: "Server error",
                error: err,
            });
        }
    },

    getHumidity: async (req, res) => {
        try {
            const { deviceId } = req.query;
            var data;
            const deviceData = await Device.findById(deviceId);
            console.log(deviceData);
            if (deviceData.deviceType === "C???m bi???n ????? ???m") {
                // value = device.value[device.value.length - 1];
                data = deviceData.data;
            }
                console.log(data);
            
            res.status(200).json({
                status: "OK",
                msg: "Get room humidity success",
                humidity: data,
            });
        } catch (err) {
            res.status(500).json({
                status: "ERR",
                msg: "Server error",
                error: err,
            });
        }
    },

    getDevicesListOfAdmin: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: string t??m ki???m
            const { q } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account || account.role !== "ADMIN") {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            // L???c danh s??ch thi???t b??? c???a h??? th???ng
            const devicesList = await Device.find({
                deviceType: { $regex: ".*" + q + ".*" },
            });

            // Tr??? v??? danh s??ch thi???t b???
            if (devicesList.length > 0) {
                return res.send({
                    result: "success",
                    devicesList: devicesList,
                });
            } else {
                return res.send({
                    result: "failed",
                    message: "Danh s??ch r???ng",
                });
            }
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
};
// module.exports = {
//     getData,control,createDevice, deleteDevice, getDevice, updateData
// }

module.exports = deviceController;

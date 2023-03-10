// const Devices = require("../models/Devices");
// const { findById } = require("../models/Devices");
const Account = require("../models/Accounts");
const Home = require("../models/Homes");
const Room = require("../models/Rooms");
const Device = require("../models/Devices");

// const getTemperature = async (req,res) => {
//     try {
//         const {roomId} = req.params;
//         const room = await Rooms.findById(roomId);
//         const devices = room.devices;
//         console.log(devices);
//         var value;
//         for (let i = 0; i < devices.length; i++) {
//             const device = await Devices.findById(devices[i]);
//             if(device.deviceType == 'temperature-celsius') {
//                 var data = device.data;
//                 value = data[data.length - 1];
//                 console.log(value);
//                 break;
//             }
//         }
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Get room temperature success',
//             temperature: value
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })

//     }
// }
// const getHumidity = async (req,res) => {
//     try {
//         const {roomId} = req.params;
//         const room = await Rooms.findById(roomId);
//         const devices = room.devices;
//         var humidities ;
//         for (let i = 0; i < devices.length; i++) {
//             let device = await Devices.find({
//                 _id : devices[i],
//                 deviceType: 'air-humidifier'
//             },{
//                 data: {
//                     $slice: -10
//                 }
//             });
//             if(device.length != 0){
//                  humidities = device[0].data
//                  humidities = humidities.map(e => { return {value: e.value, createAt: e.createAt}} )
//                 break;
//             }
//         }

//         res.status(200).json({
//             ok: 'OK',
//             msg: 'Get last 10 humidities data success',
//             humidities: humidities
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         });
//     }
// }

// const getRoomData = async (req, res) => {
//     try {
//         const room = await Rooms.findById(req.params.roomId).populate('devices').exec()
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Get room data success!',
//             room: room
//         })

//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })
//     }
// }

// const removeDevice = async (req,res) => {
//     try {
//         const {deviceId, roomId} = req.params;
//         await Rooms.updateOne({_id: roomId},{
//             $pullAll: {
//                 devices: [{_id: deviceId}]
//             }
//         })
//       //  await Devices.deleteMany({_id: deviceId})
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Remove device from room success'
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })
//     }
// }

// const createRoom = async (req,res) => {
//     try {
//         const {homeId, roomInfo} = req.body
//         console.log(homeId);
//         console.log(roomInfo);
//         const newroom = new Rooms({
//             home: homeId,
//             name: roomInfo.name
//         })
//         await newroom.save()
//         console.log(newroom);
//         const home = await Homes.findByIdAndUpdate({
//             _id : homeId
//         },
//         {
//             $push : {
//                 rooms: newroom._id
//             }
//         })
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Add new room success!',
//             newRoom: newroom
//         })

//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error'
//         })
//     }
// }
// const addExitedDevice = async (req, res) => {
//     try {
//         console.log('go here');
//         const {roomId, deviceId} = req.body;
//         await Rooms.findByIdAndUpdate(roomId,{
//             $push: {
//                 devices: deviceId
//             }
//         })
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Add new device success',
//             deviceId: deviceId
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Add device failed',
//             error: err
//         })
//     }
// }

// module.exports = {getRoomData,createRoom, getTemperature, removeDevice, getHumidity, addExitedDevice}

const roomController = {
    createRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: homeId v?? th??ng tin m???i c???a ph??ng
            const { homeId, newName } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }

            // Th??m ph??ng m???i
            const newRoom = new Room({
                homeId: homeId,
                roomName: newName,
            });

            await newRoom.save();

            // Th??m th??ng tin ph??ng m???i v??o roomsList c???a nh?? n??y
            await Home.findByIdAndUpdate(homeId, {
                $addToSet: {
                    roomsList: {
                        _id: newRoom._id,
                        roomName: newRoom.roomName,
                    },
                },
            });

            //Tr??? v??? th??ng tin ph??ng m???i th??m
            return res.send({
                result: "success",
                room: newRoom,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: Id c???a ph??ng b??? x??a
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

            const roomData = await Room.findById(roomId);

            // X??a th??ng tin ph??ng kh???i roomsList c???a nh?? ????
            await Home.updateOne(
                { _id: roomData.homeId },
                {
                    $pull: {
                        roomsList: { _id: roomId },
                    },
                }
            );

            // X??a c??c thi???t b??? c???a ph??ng kh???i database
            await Device.deleteMany({roomId: roomId});

            // X??a ph??ng kh???i database
            await Room.findByIdAndDelete(roomId);

            //Th??ng b??o th??nh c??ng
            return res.send({
                result: "success",
                message: "X??a ph??ng th??nh c??ng"
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getRoomData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: id c???a ph??ng mu???n l???y d??? li???u
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
            const roomData = await Room.findById(roomId);
            const devicesList = await Device.find({roomId: roomId});
            // roomInfo.devicesList = [...devicesList];
            // Tr??? v??? th??ng tin chi ti???t c??n ph??ng
            return res.send({
                result: "success",
                roomData: {
                    _id: roomData._id,
                    roomName: roomData.roomName,
                    devicesList: devicesList,
                },
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getRoomsList: async (req, res) => {
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
            const roomsList = await Room.find({homeId: homeId});
            
            // Tr??? v??? danh s??ch ph??ng c???a c??n nh??
            return res.send({
                result: "success",
                roomsList: roomsList,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    updateRoomData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // ?????u v??o: D??? li???u m???i c???a ph??ng
            const {  roomId, newName } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Kh??ng c?? quy???n truy c???p",
                });
            }
            // C???p nh???t th??ng tin m???i
            const newRoomData = await Room.findByIdAndUpdate(roomId, {
                roomName: newName,
            });

            // S???a th??ng tin ph??ng ??? roomsList c???a nh??
                    await Home.updateOne(
                        { _id: newRoomData.homeId, "roomsList._id": roomId },
                        {
                            $set: {
                                'roomsList.$.roomName': newName,
                            },
                        }
                    )

            await newRoomData.save();

            // Tr??? v??? th??ng tin m???i c???a c??n ph??ng
            return res.send({
                result: "success",
                // newRoomData: newRoomData,
                message : "C???p nh???t th??nh c??ng"
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
};

module.exports = roomController;

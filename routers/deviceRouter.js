const express = require('express')
// const { control, deleteDevice, createDevice, getDevice, getData } = require('../controllers/deviceControl')
const deviceController = require('../controllers/deviceController')
const router = express.Router()

// router.post('/control',control)
// router.delete('/',deleteDevice)
// router.post('/',createDevice)
// router.get('/:deviceId',getDevice)
// router.get('/:type/:roomId',getData)

//create device
router.post('/api/device/create', deviceController.createDevice);

//get device data
router.get('/api/device/detail', deviceController.getDeviceData);

//update device data
router.put('/api/device/update', deviceController.updateDeviceData);

//get devices list
router.get('/api/device/find', deviceController.getDevicesList);

//delete device
router.delete('/api/device/delete', deviceController.deleteDevice);

// //control device
// router.put('/api/device/control', deviceController.controlDevice);

// //get device data
// router.get('/api/device/detail', deviceController.getDeviceData);

module.exports = router
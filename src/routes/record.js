const express = require('express');
const Joi = require('joi');

const RecordModel = require('../models/record')

const createRequestSchema = Joi.object( {
    activityName: Joi.string().required(),
    timestamp: Joi.string().required(),
    duration: Joi.number().min(0).required(),
    calories: Joi.number().min(0),
    description: Joi.string().allow(''),
})

const router = express.Router()

// const records = [
//     {
//         __id: 'record-1',
//         activityName: 'Running',
//         timestamp: new Date(),
//         duration: 4000,
//         calories: 200,
//         description: '',
//     },
//     {
//         __id: 'record-2',
//         activityName: 'Running',
//         timestamp: new Date(),
//         duration: 4000,
//         calories: 200,
//         description: '',
//     },
//     {
//         __id: 'record-3',
//         activityName: 'Running',
//         timestamp: new Date(),
//         duration: 4000,
//         calories: 200,
//         description: '',
//     },
// ]

router.use('/:recordId', (req, res, next) => {
    const foundRecord = RecordModel.findById(req.params.recordId);
    if (!foundRecord) {
      return res.status(404).send('Record not found');
    };
    req.record = foundRecord;
    return next();
});


router.get('/', async (req, res, next)=> {
    const records = await RecordModel.find({});
    res.send(records);
});
router.post('/', async (req, res, next)=> {
    const body = req.body;
    // Validate
    // const validResult = createRequestSchema.validate(body);
    // if (validResult.error) {
    //     const errorMessage = validResult.error.details.map( er => {return er.message})
    //     return res.status(400).send(errorMessage.toString());
    // }
    // if (!(typeof body.activityName === 'string' && body.activityName.length > 0)) {
    //     return res.status(400).send('Invalid activity name');
    // };
    // const newRecord = {
    //     __id: Math.floor(Math.random() * 100000).toString(),
    //     ...body,
    // };

    const newRecord = new RecordModel({
        ...body
    });

    const errors = await newRecord.validateSync();
    if(errors) {
        const errorFieldNames= Object.keys(errors.errors);
        if (errorFieldNames.length > 0) {
            return res.status(400).send(errors.errors[errorFieldNames[0]].message);
        }
    };

    // await newRecord.save();
    // records.push(newRecord);
    return res.status(201).send(newRecord);
});
router.get('/:recordId', (req, res, next)=> {
    const recordID = req.params.recordId;
    const index = records.findIndex((record) => record.__id === recordID);
    const foundRecord = records[index];
    if (!(foundRecord)) {
        return res.status(404).send('Record not found');
    }
    return res.send(foundRecord);
});
router.put('/:recordId', (req, res, next)=> {
    const body = req.body;

    // validate
    const validateResult = updateRequestSchema.validate(body);
    if (validateResult.error) {
      // failed validation
      return res.status(400).send('Invalid request');
    }
  
    const updatedRecord = {
      ...req.record,
      ...body,
    };
    records[req.recordIndex] = updatedRecord;
    return res.status(201).send(updatedRecord);
});
router.delete('/:recordId', async (req, res, next)=> {
    await RecordModel.deleteOne({__id: req.params.recordId})
    return res.status(204).send(); // 204 = No content which mean it successfully removed
});

module.exports = router;
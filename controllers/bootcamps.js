const path=require('path');
const ErrorResponse=require('../utils/errorResponse');
const asyncHandler=require('../middleware/async');
const geocoder=require('../utils/geocoder');
const Bootcamp=require('../models/Bootcamp');
const fileupload=require('express-fileupload');
const advancedResults=require('../middleware/advancedResults');


//@desc         Get all bootcamps 
//@route        GET /api/v1/bootcamps
//@access       public
exports.getBootcamps= asyncHandler(async (req,res,next)=>{   
        res.status(200).json(res.advancedResults);
});

//@desc         Get single bootcamp 
//@route        GET /api/v1/bootcamps/:id
//@access       public
exports.getBootcamp= asyncHandler(async (req,res,next)=>{
        const bootcamp= await Bootcamp.findById(req.params.id);

        if(!bootcamp)
        {
           return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        res.status(200).json({success:true, data:bootcamp});
});


//@desc         Create new bootcamp 
//@route        POST /api/v1/bootcamps
//@access       private
exports.createBootcamp= asyncHandler(async (req,res,next)=>{
        const bootcamp= await Bootcamp.create(req.body);

        res.status(201).json({
            success:true,
            data:bootcamp
        })
});

//@desc         Update bootcamp 
//@route        PUT /api/v1/bootcamps/:id
//@access       private
exports.updateBootcamp= asyncHandler(async (req,res,next)=>{
        const bootcamp= await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        if(!bootcamp)
        {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        res.status(200).json({success:true,data:bootcamp});
});

//@desc         Delete bootcamp 
//@route        DELETE /api/v1/bootcamps/:id
//@access       private
exports.deleteBootcamp= asyncHandler(async (req,res,next)=>{
        const bootcamp= await Bootcamp.findById(req.params.id);

        if(!bootcamp)
        {
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        bootcamp.remove();

        res.status(200).json({success:true,data:{}});
});

//@desc         Get bootcamps within radius 
//@route        GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access       private
exports.getBootcampsInRadius= asyncHandler(async (req,res,next)=>{
        const {zipcode,distance}=req.params;

       //get lattitude and longitude from the geocoder
        const loc=await geocoder.geocode(zipcode);
        const lat=loc[0].latitude;
        const lng=loc[0].longitude;

        //calc radius using radians
        //Divide distance with the radius of earth.
        //Earth radius= 3963 miles or 6378 km.
        const radius=distance / 3963;

        const bootcamps= await Bootcamp.find({
             location:{ $geoWithin: {$centerSphere:[[lng,lat],radius]}}
        });

        res.status(200).json({
                success:true,
                count:bootcamps.length,
                data:bootcamps
        })
});

//@desc         Upload a photo for bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       private
exports.bootcampPhotoUpload= asyncHandler(async (req,res,next)=>{
        const bootcamp= await Bootcamp.findById(req.params.id);

        if(!bootcamp)
        {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        if(!req.files)
        {
            return next(new ErrorResponse(`Please upload a file`,400));
        }
        const file=req.files.file;
        //make sure the image is a photo
        if(!file.mimetype.startsWith('image'))
        {
            return next(new ErrorResponse(`Please upload an image file`,400));           
        }
        //Check file size
        if(file.size > process.env.MAX_FILE_UPLOAD)
        {
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400));
        }

        //Custom file name
        file.name=`photo_${bootcamp._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
             if(err)
             {
                console.error(err);
                return next(new ErrorResponse(`Problem with file upload`,500));
             }
             Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name});

             res.status(200).json({
                success:true,
                data: file.name    
             })
        });
});
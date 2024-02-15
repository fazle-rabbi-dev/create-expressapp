const corsOptions = {
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true // Allow credentials (cookies, HTTP authentication) to be sent with requests.
};

// ====================================
// Another Approach
// ====================================
/*const allowedOrigins = [
    "http://fazle-rabbi-dev.vercel.app",
    "http://google.com",
  ]*/

/*const corsOptions = {
  // origin: "*",
  // origin: ["http://one.com","http://two.com"],
  origin: (incommingOrigin, callback) => {
    if(allowedOrigins.includes(incommingOrigin) || !origin){
      callback(null, true); 
    }else{
      callback(new Error(`Oops! ${incommingOrigin} not allowed by cors`), false)
    }
  },
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
};*/

export default corsOptions;

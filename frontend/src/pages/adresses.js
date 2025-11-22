// src/divisions.jsx

const divisionsData = [
  { 
    division: "Barishal", 
    divisionbn: "বরিশাল", 
    coordinates: "22.3811, 90.3372" 
  },
  { 
    division: "Chattogram", 
    divisionbn: "চট্টগ্রাম", 
    coordinates: "23.1793, 91.9882" 
  },
  { 
    division: "Dhaka", 
    divisionbn: "ঢাকা", 
    coordinates: "23.9536, 90.1495" 
  },
  { 
    division: "Khulna", 
    divisionbn: "খুলনা", 
    coordinates: "22.8088, 89.2467" 
  },
  { 
    division: "Mymensingh", 
    divisionbn: "ময়মনসিংহ", 
    coordinates: "24.7136, 90.4502" 
  },
  { 
    division: "Rajshahi", 
    divisionbn: "রাজশাহী", 
    coordinates: "24.7106, 88.9414" 
  },
  { 
    division: "Rangpur", 
    divisionbn: "রংপুর", 
    coordinates: "25.8483, 88.9414" 
  },
  { 
    division: "Sylhet", 
    divisionbn: "সিলেট", 
    coordinates: "24.7050, 91.6761" 
  }
];

const rajshahiDivision = {
  division: "Rajshahi",
  coordinates: "24.7106, 88.9414",
  districts: [
    {
      district: "Bogura",
      coordinates: "24.8510, 89.3697",
      upazilla: [
        "Adamdighi",
        "Bogura Sadar",
        "Dhunat",
        "Dhupchanchia",
        "Gabtali",
        "Kahaloo",
        "Nandigram",
        "Sariakandi",
        "Shajahanpur",
        "Sherpur",
        "Shibganj",
        "Sonatola"
      ]
    },
    {
      district: "Chapai Nawabganj",
      coordinates: "24.7413, 88.2912",
      upazilla: ["Bholahat","Gomastapur","Nachole","Chapai Nawabganj Sadar","Shibganj"]
    },
    {
      district: "Joypurhat",
      coordinates: "25.0947, 89.0945",
      upazilla: ["Akkelpur","Joypurhat Sadar","Kalai","Khetlal","Panchbibi"]
    },
    {
      district: "Naogaon",
      coordinates: "24.9132, 88.7531",
      upazilla: ["Atrai","Badalgachhi","Manda","Dhamoirhat","Mohadevpur","Naogaon Sadar","Niamatpur","Patnitala","Porsha","Raninagar","Sapahar"]
    },
    {
      district: "Natore",
      coordinates: "24.4102, 89.0076",
      upazilla: ["Bagatipara","Baraigram","Gurudaspur","Lalpur","Natore Sadar","Singra","Naldanga"]
    },
    {
      district: "Pabna",
      coordinates: "24.1585, 89.4481",
      upazilla: ["Atgharia","Bera","Bhangura","Chatmohar","Faridpur","Ishwardi","Pabna Sadar","Santhia","Sujanagar"]
    },
    {
      district: "Rajshahi",
      coordinates: "24.3733, 88.6049",
      upazilla: ["Bagha","Bagmara","Charghat","Durgapur","Godagari","Mohanpur","Paba","Puthia","Tanore"]
    },
    {
      district: "Sirajganj",
      coordinates: "24.3141, 89.5700",
      upazilla: ["Belkuchi","Chauhali","Kamarkhanda","Kazipur","Raiganj","Shahjadpur","Sirajganj Sadar","Tarash","Ullahpara"]
    }
  ]
};

// src/addresses.jsx

const dhakaDivision = {
  division: "Dhaka",
  coordinates: "23.9536, 90.1495",
  districts: [
    {
      district: "Dhaka",
      coordinates: "23.8105, 90.3372",
      upazilla: ["Dhamrai","Dohar","Keraniganj","Nawabganj","Savar","Dhaka North City Corporation","Dhaka South City Corporation"]
    },
    {
      district: "Faridpur",
      coordinates: "23.5424, 89.6309",
      upazilla: ["Alfadanga","Bhanga","Boalmari","Charbhadrasan","Faridpur Sadar","Madhukhali","Nagarkanda","Sadarpur","Saltha"]
    },
    {
      district: "Gazipur",
      coordinates: "24.0958, 90.4125",
      upazilla: ["Gazipur Sadar","Kaliakair","Kaliganj","Kapasia","Sreepur"]
    },
    {
      district: "Gopalganj",
      coordinates: "23.0488, 89.8879",
      upazilla: ["Gopalganj Sadar","Kashiani","Kotalipara","Muksudpur","Tungipara"]
    },
    {
      district: "Kishoreganj",
      coordinates: "24.4260, 90.9821",
      upazilla: ["Austagram","Bajitpur","Bhairab","Hossainpur","Itna","Karimganj","Katiadi","Kishoreganj Sadar","Kuliarchar","Mithamain","Nikli","Pakundia","Tarail"]
    },
    {
      district: "Madaripur",
      coordinates: "23.2393, 90.1870",
      upazilla: ["Rajoir","Madaripur Sadar","Kalkini","Shibchar"]
    },
    {
      district: "Manikganj",
      coordinates: "23.8617, 90.0003",
      upazilla: ["Daulatpur","Ghior","Harirampur","Manikgonj Sadar","Saturia","Shivalaya","Singair"]
    },
    {
      district: "Munshiganj",
      coordinates: "23.4981, 90.4127",
      upazilla: ["Gazaria","Lohajang","Munshiganj Sadar","Sirajdikhan","Sreenagar","Tongibari"]
    },
    {
      district: "Narayanganj",
      coordinates: "23.7147, 90.5636",
      upazilla: ["Araihazar","Bandar","Narayanganj Sadar","Rupganj","Sonargaon"]
    },
    {
      district: "Narsingdi",
      coordinates: "24.1344, 90.7860",
      upazilla: ["Belabo","Monohardi","Narsingdi Sadar","Palash","Raipura","Shibpur"]
    },
    {
      district: "Rajbari",
      coordinates: "23.7151, 89.5875",
      upazilla: ["Baliakandi","Goalandaghat","Kalukhali","Pangsha","Rajbari Sadar"]
    },
    {
      district: "Shariatpur",
      coordinates: "23.2423, 90.4348",
      upazilla: ["Bhedarganj","Damudya","Gosairhat","Naria","Shariatpur Sadar","Zajira"]
    },
    {
      district: "Tangail",
      coordinates: "24.3917, 89.9948",
      upazilla: ["Basail","Bhuapur","Delduar","Dhanbari","Ghatail","Gopalpur","Kalihati","Madhupur","Mirzapur","Nagarpur","Sakhipur","Tangail Sadar"]
    }
  ]
};

module.exports = {
  divisionsData,
  dhakaDivision,
  rajshahiDivision
};


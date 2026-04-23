export type MPDistrict = {
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
  mandis: string[];
};

export const MP_CENTER = { lat: 23.47, lng: 77.95 };

export const MP_DISTRICTS: MPDistrict[] = [
  { name: 'Indore', nameHi: 'इंदौर', lat: 22.72, lng: 75.86, mandis: ['Indore Mandi', 'Mhow Mandi'] },
  { name: 'Bhopal', nameHi: 'भोपाल', lat: 23.26, lng: 77.41, mandis: ['Bhopal APMC', 'Berasia Mandi'] },
  { name: 'Jabalpur', nameHi: 'जबलपुर', lat: 23.18, lng: 79.95, mandis: ['Jabalpur Mandi'] },
  { name: 'Ujjain', nameHi: 'उज्जैन', lat: 23.18, lng: 75.77, mandis: ['Ujjain Mandi'] },
  { name: 'Dewas', nameHi: 'देवास', lat: 22.97, lng: 76.05, mandis: ['Dewas Mandi'] },
  { name: 'Sagar', nameHi: 'सागर', lat: 23.84, lng: 78.74, mandis: ['Sagar Mandi'] },
  { name: 'Ratlam', nameHi: 'रतलाम', lat: 23.33, lng: 75.04, mandis: ['Ratlam Mandi'] },
  { name: 'Hoshangabad', nameHi: 'होशंगाबाद', lat: 22.75, lng: 77.73, mandis: ['Hoshangabad Mandi'] },
  { name: 'Neemuch', nameHi: 'नीमच', lat: 24.47, lng: 74.87, mandis: ['Neemuch Mandi'] },
  { name: 'Mandsaur', nameHi: 'मंदसौर', lat: 24.07, lng: 75.07, mandis: ['Mandsaur Mandi'] },
  { name: 'Gwalior', nameHi: 'ग्वालियर', lat: 26.22, lng: 78.18, mandis: ['Gwalior Mandi', 'Lashkar Mandi'] },
  { name: 'Satna', nameHi: 'सतना', lat: 24.58, lng: 80.83, mandis: ['Satna Mandi'] },
  { name: 'Rewa', nameHi: 'रीवा', lat: 24.53, lng: 81.30, mandis: ['Rewa Mandi'] },
  { name: 'Chhindwara', nameHi: 'छिंदवाड़ा', lat: 22.06, lng: 78.94, mandis: ['Chhindwara Mandi'] },
  { name: 'Vidisha', nameHi: 'विदिशा', lat: 23.52, lng: 77.81, mandis: ['Vidisha Mandi'] },
  { name: 'Shajapur', nameHi: 'शाजापुर', lat: 23.43, lng: 76.27, mandis: ['Shajapur Mandi'] },
  { name: 'Khandwa', nameHi: 'खंडवा', lat: 21.82, lng: 76.35, mandis: ['Khandwa Mandi'] },
  { name: 'Betul', nameHi: 'बैतूल', lat: 21.91, lng: 77.90, mandis: ['Betul Mandi'] },
  { name: 'Damoh', nameHi: 'दमोह', lat: 23.84, lng: 79.44, mandis: ['Damoh Mandi'] },
  { name: 'Morena', nameHi: 'मुरैना', lat: 26.50, lng: 77.99, mandis: ['Morena Mandi'] },
  { name: 'Shivpuri', nameHi: 'शिवपुरी', lat: 25.43, lng: 77.66, mandis: ['Shivpuri Mandi'] },
  { name: 'Guna', nameHi: 'गुना', lat: 24.65, lng: 77.31, mandis: ['Guna Mandi'] },
  { name: 'Tikamgarh', nameHi: 'टीकमगढ़', lat: 24.74, lng: 78.83, mandis: ['Tikamgarh Mandi'] },
  { name: 'Chhatarpur', nameHi: 'छतरपुर', lat: 24.92, lng: 79.59, mandis: ['Chhatarpur Mandi'] },
  { name: 'Panna', nameHi: 'पन्ना', lat: 24.72, lng: 80.19, mandis: ['Panna Mandi'] },
  { name: 'Seoni', nameHi: 'सिवनी', lat: 22.08, lng: 79.54, mandis: ['Seoni Mandi'] },
  { name: 'Narsinghpur', nameHi: 'नरसिंहपुर', lat: 22.95, lng: 79.19, mandis: ['Narsinghpur Mandi'] },
  { name: 'Dhar', nameHi: 'धार', lat: 22.60, lng: 75.30, mandis: ['Dhar Mandi'] },
  { name: 'Jhabua', nameHi: 'झाबुआ', lat: 22.77, lng: 74.59, mandis: ['Jhabua Mandi'] },
  { name: 'Barwani', nameHi: 'बड़वानी', lat: 22.04, lng: 74.90, mandis: ['Barwani Mandi'] },
  { name: 'Khargone', nameHi: 'खरगोन', lat: 21.82, lng: 75.62, mandis: ['Khargone Mandi'] },
  { name: 'Burhanpur', nameHi: 'बुरहानपुर', lat: 21.31, lng: 76.23, mandis: ['Burhanpur Mandi'] },
  { name: 'Harda', nameHi: 'हरदा', lat: 22.34, lng: 77.10, mandis: ['Harda Mandi'] },
  { name: 'Raisen', nameHi: 'रायसेन', lat: 23.33, lng: 77.79, mandis: ['Raisen Mandi'] },
  { name: 'Sehore', nameHi: 'सीहोर', lat: 23.20, lng: 77.08, mandis: ['Sehore Mandi'] },
  { name: 'Rajgarh', nameHi: 'राजगढ़', lat: 23.78, lng: 76.62, mandis: ['Rajgarh Mandi'] },
  { name: 'Agar Malwa', nameHi: 'आगर मालवा', lat: 23.71, lng: 76.01, mandis: ['Agar Mandi'] },
  { name: 'Ashok Nagar', nameHi: 'अशोकनगर', lat: 24.58, lng: 77.73, mandis: ['Ashok Nagar Mandi'] },
  { name: 'Datia', nameHi: 'दतिया', lat: 25.67, lng: 78.46, mandis: ['Datia Mandi'] },
  { name: 'Bhind', nameHi: 'भिंड', lat: 26.56, lng: 78.78, mandis: ['Bhind Mandi'] },
  { name: 'Balaghat', nameHi: 'बालाघाट', lat: 21.81, lng: 80.19, mandis: ['Balaghat Mandi'] },
  { name: 'Mandla', nameHi: 'मंडला', lat: 22.60, lng: 80.38, mandis: ['Mandla Mandi'] },
  { name: 'Dindori', nameHi: 'डिंडोरी', lat: 22.95, lng: 81.08, mandis: ['Dindori Mandi'] },
  { name: 'Katni', nameHi: 'कटनी', lat: 23.83, lng: 80.40, mandis: ['Katni Mandi'] },
  { name: 'Umaria', nameHi: 'उमरिया', lat: 23.52, lng: 80.83, mandis: ['Umaria Mandi'] },
  { name: 'Shahdol', nameHi: 'शहडोल', lat: 23.30, lng: 81.36, mandis: ['Shahdol Mandi'] },
  { name: 'Anuppur', nameHi: 'अनूपपुर', lat: 23.11, lng: 81.69, mandis: ['Anuppur Mandi'] },
  { name: 'Sidhi', nameHi: 'सीधी', lat: 24.40, lng: 81.88, mandis: ['Sidhi Mandi'] },
  { name: 'Singrauli', nameHi: 'सिंगरौली', lat: 24.20, lng: 82.67, mandis: ['Singrauli Mandi'] },
  { name: 'Alirajpur', nameHi: 'अलीराजपुर', lat: 22.31, lng: 74.36, mandis: ['Alirajpur Mandi'] },
  { name: 'Niwari', nameHi: 'निवाड़ी', lat: 25.12, lng: 78.39, mandis: ['Niwari Mandi'] },
  { name: 'Maihar', nameHi: 'मैहर', lat: 24.26, lng: 80.76, mandis: ['Maihar Mandi'] },
];

export const LOCATION_NAMES: string[] = MP_DISTRICTS.map((d) => d.name);

export const getDistrictByName = (name: string): MPDistrict | undefined =>
  MP_DISTRICTS.find((d) => d.name.toLowerCase() === name.toLowerCase());

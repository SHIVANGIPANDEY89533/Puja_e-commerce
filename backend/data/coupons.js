const coupons = [
  {
    code: 'WELCOME10',
    discount: 10,
    type: 'percent',
    active: true,
    minCart: 500
  },
  {
    code: 'FESTIVE20',
    discount: 20,
    type: 'percent',
    active: true,
    minCart: 1000
  },
  {
    code: 'FLAT50',
    discount: 50,
    type: 'flat',
    active: true,
    minCart: 300
  },
  {
    code: 'SUPER30',
    discount: 30,
    type: 'percent',
    active: false,
    minCart: 1500
  }
];

export default coupons;

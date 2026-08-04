const generatePNR = () => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `PNR${randomNumber}`;
};

export default generatePNR;


function rotateLoader() {
  let loadingArray = ['\\', '|', '/', '-'];
  let x = 0;

  return setInterval(() => {
    process.stdout.write('\r' + loadingArray[x++]);
    x &= 3;
  }, 250);
}

rotateLoader();
let startTime: number, endTime: number, location: string;

export function start(name: string) {
  startTime = performance.now();
  location = name;
};

export function end() {
  endTime = performance.now();
  let timeDiff = endTime - startTime; //in ms 
  
  // get seconds 
  let miliSeconds = Math.round(timeDiff);
  console.log(location, miliSeconds + " miliseconds");
}
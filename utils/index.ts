export const calculateLogSeconds = (matches: Array<string>) => {
  const h = Number(matches[1]);
  const m = Number(matches[2]);
  const s = Number(matches[3]);
  const ms = Number(matches[4]);
  return h * 3600 + m * 60 + s + ms / 1000;
};

export function millisToMinutesAndSeconds(millis: number) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (parseFloat(seconds) < 10 ? "0" : "") + seconds;
}

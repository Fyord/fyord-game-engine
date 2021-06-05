export async function PlayAudio(audioSourceUrl: string): Promise<any> {
  return new Promise(resolve => {
    const audio = new Audio(audioSourceUrl);
    audio.play();
    audio.onended = (() => {
      resolve(true);
    });
  });
}

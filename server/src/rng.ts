//esta funcion toma un numero random de 1 a 0 para multiplicarlo con el max - min, sumarle el min y al 
// finalizar sumar el min otra vez para que el numero nunca sea 0
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//funcion que reordena los arrays que se le pasan
export function shuffle<T>(a: T[]) {
  return a.sort(() => Math.random() - 0.5);
}


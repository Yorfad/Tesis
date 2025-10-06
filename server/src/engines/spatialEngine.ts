import { shuffle, randInt } from '../rng';
import { objectLibrary } from './objectLibrary';

// Las interfaces SceneObject y SpatialItem se quedan igual
interface SceneObject {
    id: string;
    name: string;
    sprite_name: string;
    position_key: string;
}
export interface SpatialItem {
  kind: 'spatial_relations';
  prompt: string;
  sceneObjects: SceneObject[];
  correctObjectId: string;
  hints: any; // <-- AÑADIMOS LA PROPIEDAD QUE FALTABA
}

export function buildSpatialExercises(outline: any): { items: SpatialItem[], targetCount: number, perQuestion: number } {
  const targetCount = outline?.scoring?.target_count ?? 5;
  const perQuestion = outline?.scoring?.per_question ?? 10;
  const items: SpatialItem[] = [];
  const categoryName = outline.use_category;
  // 2. Busca los objetos de esa categoría en nuestra librería
  const objectPool = (objectLibrary as any)[categoryName];

  if (!objectPool) {
    throw new Error(`Categoría de objeto "${categoryName}" no encontrada en la librería.`);
  }

  for (let i = 0; i < targetCount; i++) {
     const selectedObjects = shuffle([...objectPool]).slice(0, 3);
    
    const sceneObjects: SceneObject[] = selectedObjects.map((obj, index) => ({
      ...obj,
      position_key: outline.concepts[index].key
    }));

    // 3. Elegimos la respuesta correcta de ese orden estable
     const correctIndex = randInt(0, 2);
    const correctObject = sceneObjects[correctIndex];
    const correctConcept = outline.concepts.find((c: any) => c.key === correctObject.position_key);

    // 4. Construimos la pregunta
    const prompt = outline.question_template
      .replace('{categoria}', categoryName)
      .replace('{posicion}', correctConcept.label);

    // 5. Ensamblamos el ejercicio
    items.push({
        kind: 'spatial_relations',
        prompt: prompt, // <-- LA LÍNEA QUE FALTABA
        sceneObjects: sceneObjects,
        correctObjectId: correctObject.id,
        hints: outline.hints,
    });
  }

  return { items, targetCount, perQuestion };
}
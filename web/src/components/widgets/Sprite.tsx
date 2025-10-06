// src/components/widgets/Sprite.tsx
import { spriteSheetData, spriteSheetImage, type SpriteData } from '../../../public/lib/spriteData';

type SpriteProps = {
  name: string; // ej: "ambulance.png"
  scale?: number;
  className?: string;
};

export default function Sprite({ name, scale = 1, className }: SpriteProps) {
  const sprite: SpriteData | undefined = spriteSheetData[name];

  if (!sprite) {
    console.warn(`Sprite con nombre "${name}" no encontrado.`);
    return <div style={{ width: 50, height: 50, border: '1px solid red' }} />;
  }

  const style = {
    backgroundImage: `url(${spriteSheetImage})`,
    backgroundPosition: `-${sprite.x * scale}px -${sprite.y * scale}px`,
    backgroundSize: `${192 * scale}px ${192 * scale}px`,
    width: `${sprite.width * scale}px`,
    height: `${sprite.height * scale}px`,
    imageRendering: 'pixelated' as const, // Para que el pixel art se vea nítido
  };

  return <div style={style} className={className} />;
}
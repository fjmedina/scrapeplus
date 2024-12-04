export function generateBrandVariants(brand: string): string[] {
  const variants = new Set<string>();
  
  // Añadir la marca original
  variants.add(brand);

  // Remover espacios
  variants.add(brand.replace(/\s+/g, ''));

  // Separar palabras
  const words = brand.split(/\s+/);
  if (words.length > 1) {
    // Añadir variantes con diferentes separadores
    variants.add(words.join('-'));
    variants.add(words.join('_'));
    
    // Añadir combinaciones de palabras en diferente orden
    if (words.length === 2) {
      variants.add(`${words[1]} ${words[0]}`);
    }
  }

  // Manejar caracteres especiales comunes
  variants.add(brand.normalize('NFD').replace(/[\u0300-\u036f]/g, '')); // Remover acentos
  variants.add(brand.toLowerCase());
  variants.add(brand.toUpperCase());

  // Manejar palabras comunes que podrían ser parte del nombre
  const commonWords = ['el', 'la', 'los', 'las', 'de', 'del'];
  words.forEach(word => {
    if (commonWords.includes(word.toLowerCase())) {
      variants.add(words.filter(w => w !== word).join(' '));
    }
  });

  return Array.from(variants);
}
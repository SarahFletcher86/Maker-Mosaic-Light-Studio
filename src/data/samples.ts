import { SampleDrawing } from '../types';

export const SAMPLE_DRAWINGS: SampleDrawing[] = [
  {
    id: 'crystal-sphere',
    name: '3D Crystal & Sphere (Light Practice)',
    category: '3D Form Training',
    description: 'Perfect for learning core shadow, highlight spot, cast shadow, and ambient light on curved vs flat planes.',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <!-- Ground plane line -->
      <path d="M 50 480 Q 300 520 550 480" stroke="#111827" stroke-width="5" />
      
      <!-- Central Sphere -->
      <circle cx="230" cy="320" r="110" fill="none" stroke="#111827" stroke-width="6" />
      
      <!-- Gem Crystal -->
      <polygon points="430,220 480,290 450,390 390,390 360,290" fill="none" stroke="#111827" stroke-width="6" />
      <line x1="430" y1="220" x2="420" y2="390" stroke="#111827" stroke-width="4" />
      <line x1="430" y1="220" x2="390" y2="390" stroke="#111827" stroke-width="4" />
      <line x1="360" y1="290" x2="480" y2="290" stroke="#111827" stroke-width="4" />
      
      <!-- Small floating orb -->
      <circle cx="150" cy="180" r="40" fill="none" stroke="#111827" stroke-width="5" />
      
      <!-- Pedestal Cylinder -->
      <ellipse cx="230" cy="430" rx="90" ry="25" stroke="#111827" stroke-width="5" />
      <line x1="140" y1="430" x2="140" y2="470" stroke="#111827" stroke-width="5" />
      <line x1="320" y1="430" x2="320" y2="470" stroke="#111827" stroke-width="5" />
      <ellipse cx="230" cy="470" rx="90" ry="25" stroke="#111827" stroke-width="5" />
    </svg>`
  },
  {
    id: 'baby-dragon',
    name: 'Little Elemental Dragon',
    category: 'Cute & Characters',
    description: 'Features curved body parts, horns, wings, and belly plates for multi-surface lighting.',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Head Contour -->
      <path d="M 240 180 C 240 120, 360 120, 380 180 C 400 210, 390 260, 340 280 C 290 290, 240 250, 240 180 Z" />
      
      <!-- Cute Eye -->
      <ellipse cx="290" cy="190" rx="20" ry="25" fill="#111827" />
      <circle cx="283" cy="182" r="8" fill="#FFFFFF" />
      <ellipse cx="350" cy="185" rx="14" ry="18" fill="#111827" />
      <circle cx="345" cy="180" r="5" fill="#FFFFFF" />
      
      <!-- Cheerful Smile -->
      <path d="M 310 235 Q 330 255 350 235" stroke-width="5" />
      <path d="M 320 220 C 322 225, 325 225, 327 220" />
      
      <!-- Horns -->
      <path d="M 260 140 Q 220 90 200 110 Q 230 140 250 150 Z" />
      <path d="M 350 135 Q 380 70 410 90 Q 380 120 365 140 Z" />
      
      <!-- Chubby Body -->
      <path d="M 260 270 C 200 320, 200 440, 280 470 C 360 490, 420 420, 380 300" />
      
      <!-- Belly Scales -->
      <path d="M 280 285 C 250 340, 260 420, 310 460" stroke-width="4" stroke-dasharray="8 6" />
      <path d="M 285 320 Q 315 325 330 300" stroke-width="4" />
      <path d="M 275 370 Q 320 375 345 350" stroke-width="4" />
      <path d="M 280 420 Q 325 425 355 395" stroke-width="4" />

      <!-- Cute Wings -->
      <path d="M 380 320 Q 480 260 510 320 Q 450 350 420 380 Q 400 350 380 350" />
      <path d="M 450 310 L 450 350" stroke-width="3" />
      <path d="M 480 315 L 480 340" stroke-width="3" />
      
      <!-- Paws -->
      <ellipse cx="250" cy="460" rx="30" ry="20" />
      <ellipse cx="350" cy="460" rx="30" ry="20" />
      
      <!-- Tail -->
      <path d="M 370 440 Q 480 470 500 420 Q 480 400 440 420" />
      <path d="M 500 420 L 525 400 L 515 435 Z" fill="none" />
    </svg>`
  },
  {
    id: 'flower-mandala',
    name: 'Lotus Mandala Line Art',
    category: 'Mandalas & Nature',
    description: 'Radiating overlapping petals for radial lighting, rim light halos, and intricate cast shadows.',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="300" cy="300" r="40" stroke-width="5" />
      <circle cx="300" cy="300" r="18" stroke-width="3" />
      
      <!-- Inner Petals -->
      <path d="M 300 260 Q 330 220 300 180 Q 270 220 300 260 Z" />
      <path d="M 300 340 Q 330 380 300 420 Q 270 380 300 340 Z" />
      <path d="M 260 300 Q 220 330 180 300 Q 220 270 260 300 Z" />
      <path d="M 340 300 Q 380 330 420 300 Q 380 270 340 300 Z" />
      
      <!-- Diagonal Petals -->
      <path d="M 270 270 Q 210 210 215 155 Q 270 210 270 270 Z" />
      <path d="M 330 270 Q 390 210 385 155 Q 330 210 330 270 Z" />
      <path d="M 270 330 Q 210 390 215 445 Q 270 390 270 330 Z" />
      <path d="M 330 330 Q 390 390 385 445 Q 330 390 330 330 Z" />
      
      <!-- Outer Ring & Details -->
      <circle cx="300" cy="300" r="240" stroke-width="5" />
      <circle cx="300" cy="300" r="260" stroke-width="3" stroke-dasharray="6 8" />
    </svg>`
  },
  {
    id: 'sleeping-cat',
    name: 'Cozy Sleeping Cat',
    category: 'Cute & Characters',
    description: 'Curved fur shapes, blanket folds, and warm environmental lighting test.',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Cushion Base -->
      <ellipse cx="300" cy="420" rx="220" ry="70" stroke-width="6" />
      <ellipse cx="300" cy="445" rx="200" ry="50" stroke-width="4" stroke-dasharray="8 6" />

      <!-- Curled Cat Body -->
      <path d="M 180 380 C 140 280, 240 180, 360 200 C 460 220, 480 340, 420 400 C 380 430, 240 430, 180 380 Z" stroke-width="6" />
      
      <!-- Cat Head -->
      <circle cx="250" cy="290" r="65" stroke-width="5" />
      <!-- Ears -->
      <polygon points="200,250 180,180 230,230" stroke-width="5" />
      <polygon points="280,230 320,170 310,245" stroke-width="5" />
      
      <!-- Sleeping Closed Eyes -->
      <path d="M 215 295 Q 230 310 245 295" stroke-width="5" />
      <path d="M 265 295 Q 280 310 295 295" stroke-width="5" />
      
      <!-- Nose & Mouth -->
      <polygon points="252,310 258,310 255,316" fill="#111827" />
      <path d="M 255 316 Q 245 325 240 320" stroke-width="4" />
      <path d="M 255 316 Q 265 325 270 320" stroke-width="4" />
      
      <!-- Whiskers -->
      <line x1="200" y1="305" x2="150" y2="295" stroke-width="4" />
      <line x1="195" y1="315" x2="145" y2="320" stroke-width="4" />
      <line x1="305" y1="305" x2="355" y2="295" stroke-width="4" />
      <line x1="310" y1="315" x2="360" y2="320" stroke-width="4" />
      
      <!-- Tail wrapped around -->
      <path d="M 420 380 C 470 360, 440 260, 360 280 Q 320 290, 350 320" stroke-width="6" />
    </svg>`
  },
  {
    id: 'cyber-hero',
    name: 'Anime Cyber Hero',
    category: 'Cute & Characters',
    description: 'Crisp angular lines, face contours, hair segments, and dramatic rim lighting test.',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Face Contour -->
      <path d="M 200 240 L 220 360 L 300 420 L 380 360 L 400 240 Z" stroke-width="6" />
      
      <!-- Anime Eyes -->
      <polygon points="230,280 285,285 275,310 235,305" stroke-width="5" />
      <circle cx="260" cy="295" r="10" fill="#111827" />
      
      <polygon points="315,285 370,280 365,305 325,310" stroke-width="5" />
      <circle cx="340" cy="295" r="10" fill="#111827" />
      
      <!-- Eyebrows -->
      <path d="M 220 265 Q 260 260 285 275" stroke-width="6" />
      <path d="M 380 265 Q 340 260 315 275" stroke-width="6" />
      
      <!-- Nose & Mouth -->
      <path d="M 298 335 L 302 345 L 295 350" stroke-width="4" />
      <path d="M 275 375 Q 300 385 325 375" stroke-width="5" />
      
      <!-- Dramatic Spiky Hair -->
      <path d="M 180 260 L 120 180 L 210 200 L 230 110 L 290 180 L 320 90 L 370 180 L 430 120 L 420 210 L 490 220 L 420 270" stroke-width="6" />
      
      <!-- Collar & Jacket -->
      <path d="M 220 380 L 150 490 L 260 520 L 300 440 L 340 520 L 450 490 L 380 380" stroke-width="6" />
    </svg>`
  }
];

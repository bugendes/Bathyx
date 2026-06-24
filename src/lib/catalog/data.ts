/**
 * Bathyx — Ocean feature catalog
 * Real ocean trenches, seamounts, ridges, and hydrothermal vents
 */
import type { OceanFeature } from './types';

export const oceanFeatures: OceanFeature = {
  trenches: [
    {
      id: 'mariana',
      name: 'Mariana Trench',
      region: 'Pacific Ocean',
      maxDepth: 10994,
      coordinates: [
        [142.20, 11.35], [142.50, 11.50], [143.00, 11.80],
        [143.50, 12.10], [144.00, 12.50], [144.20, 12.80]
      ],
      length: 2550,
      description: 'Deepest known oceanic trench on Earth. Contains the Challenger Deep.'
    },
    {
      id: 'tonga',
      name: 'Tonga Trench',
      region: 'Pacific Ocean',
      maxDepth: 10823,
      coordinates: [
        [-175.00, -22.00], [-174.50, -23.00], [-174.00, -24.00],
        [-173.50, -25.00], [-173.00, -26.00]
      ],
      length: 860,
      description: 'Second deepest trench, near the Tonga island arc.'
    },
    {
      id: 'philippine',
      name: 'Philippine Trench',
      region: 'Pacific Ocean',
      maxDepth: 10540,
      coordinates: [
        [126.50, 5.00], [127.00, 6.50], [127.50, 8.00],
        [127.80, 9.50], [128.00, 11.00]
      ],
      length: 1320,
      description: 'Deep trench east of the Philippine archipelago.'
    },
    {
      id: 'kermadec',
      name: 'Kermadec Trench',
      region: 'Pacific Ocean',
      maxDepth: 10047,
      coordinates: [
        [-177.50, -30.00], [-177.00, -31.50], [-176.50, -33.00],
        [-176.00, -34.50]
      ],
      length: 1000,
      description: 'Continuation of the Tonga Trench to the south.'
    },
    {
      id: 'japan',
      name: 'Japan Trench',
      region: 'Pacific Ocean',
      maxDepth: 9000,
      coordinates: [
        [143.00, 36.00], [143.50, 37.50], [144.00, 39.00],
        [144.50, 40.50]
      ],
      length: 800,
      description: 'Site of the 2011 Tōhoku earthquake and tsunami.'
    },
    {
      id: 'puerto-rico',
      name: 'Puerto Rico Trench',
      region: 'Atlantic Ocean',
      maxDepth: 8376,
      coordinates: [
        [-67.00, 19.50], [-66.00, 19.80], [-65.00, 20.00],
        [-64.00, 20.20], [-63.00, 20.30]
      ],
      length: 800,
      description: 'Deepest point in the Atlantic Ocean.'
    },
    {
      id: 'sunda',
      name: 'Sunda Trench',
      region: 'Indian Ocean',
      maxDepth: 7725,
      coordinates: [
        [95.00, -3.00], [96.50, -5.00], [98.00, -7.00],
        [100.00, -9.00], [102.00, -11.00], [104.00, -13.00]
      ],
      length: 3200,
      description: 'Major subduction zone in the Indian Ocean.'
    },
    {
      id: 'peru-chile',
      name: 'Peru-Chile Trench',
      region: 'Pacific Ocean',
      maxDepth: 8065,
      coordinates: [
        [-76.00, -5.00], [-75.00, -10.00], [-74.00, -15.00],
        [-73.00, -20.00], [-72.00, -25.00], [-71.50, -30.00],
        [-71.00, -35.00], [-72.00, -40.00]
      ],
      length: 5900,
      description: 'Also known as the Atacama Trench, runs along South America.'
    },
    {
      id: 'aleutian',
      name: 'Aleutian Trench',
      region: 'Pacific Ocean',
      maxDepth: 7679,
      coordinates: [
        [175.00, 51.00], [178.00, 51.50], [-178.00, 52.00],
        [-174.00, 52.00], [-170.00, 51.50], [-165.00, 51.00]
      ],
      length: 3400,
      description: 'Subduction zone along the Aleutian Islands arc.'
    },
    {
      id: 'south-sandwich',
      name: 'South Sandwich Trench',
      region: 'Atlantic Ocean',
      maxDepth: 8264,
      coordinates: [
        [-27.00, -55.00], [-26.50, -56.00], [-26.00, -57.00],
        [-25.50, -58.00]
      ],
      length: 965,
      description: 'Deepest trench in the Southern Atlantic.'
    }
  ],

  seamounts: [
    {
      id: 'mauna-kea',
      name: 'Mauna Kea',
      lon: -155.47, lat: 19.82,
      height: 10203, summitDepth: 0,
      type: 'shield',
      description: 'Tallest mountain on Earth from base to peak (10,203m from ocean floor).'
    },
    {
      id: 'seine',
      name: 'Seine Guyot',
      lon: -28.50, lat: 33.75,
      height: 4500, summitDepth: 180,
      type: 'guyot',
      description: 'Flat-topped seamount in the mid-Atlantic.'
    },
    {
      id: 'great-meteor',
      name: 'Great Meteor Seamount',
      lon: -28.50, lat: 30.00,
      height: 4000, summitDepth: 270,
      type: 'guyot',
      description: 'Large seamount in the North Atlantic with a flat summit.'
    },
    {
      id: 'emperor',
      name: 'Emperor Seamounts',
      lon: 170.00, lat: 43.00,
      height: 3500, summitDepth: 800,
      type: 'shield',
      description: 'Chain of seamounts extending from the Hawaiian hotspot.'
    },
    {
      id: 'lopo-noronha',
      name: 'Fernando de Noronha Ridge',
      lon: -32.42, lat: -3.85,
      height: 3600, summitDepth: 0,
      type: 'volcanic',
      description: 'Volcanic archipelago rising from the Mid-Atlantic Ridge.'
    },
    {
      id: 'bounty',
      name: 'Bounty Seamount',
      lon: -130.20, lat: -25.30,
      height: 3200, summitDepth: 450,
      type: 'shield',
      description: 'Underwater volcano in the Pacific-Antarctic Ridge region.'
    },
    {
      id: 'cobb',
      name: 'Cobb Seamount',
      lon: -130.80, lat: 46.75,
      height: 3100, summitDepth: 34,
      type: 'shield',
      description: 'Isolated seamount with a remarkably shallow summit near the Juan de Fuca Ridge.'
    },
    {
      id: 'challenger',
      name: 'Challenger Plateau',
      lon: 167.00, lat: -34.00,
      height: 2500, summitDepth: 1100,
      type: 'guyot',
      description: 'Submerged plateau west of New Zealand.'
    }
  ],

  vents: [
    {
      id: 'black-smoker-13n',
      name: '13°N Hydrothermal Field',
      lon: -103.50, lat: 12.95,
      depth: 2500, temperature: 380,
      type: 'black-smoker', discovered: 1981,
      description: 'First deep-sea black smokers discovered in the eastern Pacific.'
    },
    {
      id: 'lost-city',
      name: 'Lost City Hydrothermal Field',
      lon: -42.12, lat: 30.12,
      depth: 750, temperature: 91,
      type: 'warm-seep', discovered: 2000,
      description: 'Unique alkaline hydrothermal field on the Mid-Atlantic Ridge.'
    },
    {
      id: 'rainbow',
      name: 'Rainbow Vent Field',
      lon: -33.90, lat: 36.24,
      depth: 2300, temperature: 365,
      type: 'black-smoker', discovered: 1994,
      description: 'High-temperature vents rich in metals and supporting unique fauna.'
    },
    {
      id: 'tag',
      name: 'TAG Hydrothermal Field',
      lon: -44.83, lat: 26.14,
      depth: 3670, temperature: 363,
      type: 'black-smoker', discovered: 1985,
      description: 'One of the largest known submarine sulfide deposits.'
    },
    {
      id: 'pacmanus',
      name: 'PACMANUS Vent Field',
      lon: 152.07, lat: -5.17,
      depth: 1700, temperature: 350,
      type: 'black-smoker', discovered: 1991,
      description: 'Volcanic-hosted vent system in the Manus Basin.'
    },
    {
      id: 'epr-21s',
      name: 'East Pacific Rise 21°S',
      lon: -113.50, lat: -21.00,
      depth: 2600, temperature: 355,
      type: 'black-smoker', discovered: 1979,
      description: 'Classic fast-spreading ridge hydrothermal site.'
    },
    {
      id: 'ashadze',
      name: 'Ashadze Vent Field',
      lon: -44.92, lat: 12.98,
      depth: 4080, temperature: 305,
      type: 'black-smoker', discovered: 2003,
      description: 'Deepest known hydrothermal vents in the Mid-Atlantic Ridge.'
    },
    {
      id: 'lau-basin',
      name: 'Lau Basin Vents',
      lon: -176.30, lat: -20.05,
      depth: 1750, temperature: 360,
      type: 'black-smoker', discovered: 2004,
      description: 'Diverse vent fields in the back-arc Lau Basin.'
    },
    {
      id: 'brothers',
      name: 'Brothers Volcano Vents',
      lon: 176.00, lat: -34.85,
      depth: 1850, temperature: 302,
      type: 'black-smoker', discovered: 1999,
      description: 'Submarine arc volcano with active hydrothermal systems.'
    },
    {
      id: 'pele',
      name: "Pele's Vents",
      lon: -129.57, lat: 47.93,
      depth: 1550, temperature: 310,
      type: 'lava-flow', discovered: 2006,
      description: 'Lava-heated hydrothermal vents on the Juan de Fuca Ridge.'
    }
  ],

  ridges: [
    {
      id: 'mid-atlantic',
      name: 'Mid-Atlantic Ridge',
      coordinates: [
        [-30.00, 85.00], [-25.00, 70.00], [-20.00, 60.00],
        [-18.00, 50.00], [-30.00, 40.00], [-35.00, 30.00],
        [-33.00, 20.00], [-40.00, 10.00], [-43.00, 0.00],
        [-42.00, -10.00], [-35.00, -20.00], [-28.00, -30.00],
        [-18.00, -40.00], [-14.00, -50.00], [-12.00, -60.00]
      ],
      length: 16000,
      spreadingRate: 25,
      description: 'Slow-spreading mid-ocean ridge running the length of the Atlantic.'
    },
    {
      id: 'east-pacific-rise',
      name: 'East Pacific Rise',
      coordinates: [
        [-110.00, 20.00], [-107.00, 15.00], [-105.00, 10.00],
        [-104.00, 5.00], [-106.00, 0.00], [-108.00, -5.00],
        [-113.00, -10.00], [-116.00, -15.00], [-118.00, -20.00],
        [-120.00, -25.00], [-123.00, -30.00], [-128.00, -35.00]
      ],
      length: 7000,
      spreadingRate: 150,
      description: 'Fast-spreading ridge in the eastern Pacific.'
    },
    {
      id: 'pacific-antarctic',
      name: 'Pacific-Antarctic Ridge',
      coordinates: [
        [-130.00, -40.00], [-135.00, -45.00], [-140.00, -50.00],
        [-150.00, -55.00], [-160.00, -58.00]
      ],
      length: 5000,
      spreadingRate: 75,
      description: 'Ridge separating the Pacific and Antarctic plates.'
    },
    {
      id: 'indian-ocean-ridge',
      name: 'Central Indian Ridge',
      coordinates: [
        [66.00, -5.00], [65.00, -10.00], [64.00, -15.00],
        [65.00, -20.00], [67.00, -25.00]
      ],
      length: 3500,
      spreadingRate: 50,
      description: 'Mid-ocean ridge in the western Indian Ocean.'
    },
    {
      id: 'arctic-ridge',
      name: 'Gakkel Ridge',
      coordinates: [
        [7.00, 85.00], [15.00, 83.00], [30.00, 81.00],
        [50.00, 80.00], [70.00, 79.00], [90.00, 78.00],
        [110.00, 77.00], [120.00, 76.00]
      ],
      length: 1800,
      spreadingRate: 13,
      description: 'Slowest spreading ridge on Earth, beneath the Arctic Ocean.'
    }
  ]
};

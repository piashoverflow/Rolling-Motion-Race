# Moment of Inertia & Rolling Motion Race on an Incline

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Author: Shamsuddin Piash](https://img.shields.io/badge/Author-Shamsuddin%20Piash-0ea5e9.svg)](https://piashoverflow.github.io)
[![BUET ME](https://img.shields.io/badge/Institution-BUET%20'25-10b981.svg)](https://buet.ac.bd)

> **Interactive Computational Physics Simulator & Educational Workbench**  
> Developed by **Shamsuddin Piash** | Department of Mechanical Engineering, Bangladesh University of Engineering and Technology (BUET).

---

## 🔬 Overview & Conceptual Motivation

Interactive rigid-body dynamics simulation analyzing moment of inertia tensors and kinetic energy partitioning for objects rolling down an incline.

Designed from **first-principles physics and numerical mechanics**, this simulation bridges textbook analytical theory and real-time computation. It enables students, researchers, and competitive engineering candidates to visualize dynamic force interactions, observe parametric trends, and verify conservation laws interactively.

---

## 📐 Mathematical Formulation & Physics Derivations

### Governing Dynamic Equations

For a rigid body of mass $m$, radius $R$, and centroidal moment of inertia $I_{cm} = c \cdot m R^2$ rolling without slipping down an incline angle $\theta$:

$$m g \sin\theta - f_s = m a_{cm}, \quad f_s R = I_{cm} \alpha, \quad a_{cm} = \alpha R$$

Yielding linear center-of-mass acceleration:

$$a_{cm} = \frac{g \sin\theta}{1 + \frac{I_{cm}}{m R^2}} = \frac{g \sin\theta}{1 + c}$$

Kinetic energy partitioning:

$$K_{total} = K_{trans} + K_{rot} = \frac{1}{2} m v_{cm}^2 + \frac{1}{2} I_{cm} \omega^2 = \frac{1}{2} m v_{cm}^2 (1 + c)$$

Geometric constant $c$:
- Solid Sphere: $c = 2/5 \implies a = \frac{5}{7} g \sin\theta \approx 0.714 g \sin\theta$
- Solid Cylinder / Disk: $c = 1/2 \implies a = \frac{2}{3} g \sin\theta \approx 0.667 g \sin\theta$
- Spherical Shell: $c = 2/3 \implies a = \frac{3}{5} g \sin\theta = 0.600 g \sin\theta$
- Thin Ring / Hoop: $c = 1 \implies a = \frac{1}{2} g \sin\theta = 0.500 g \sin\theta$

---

## ✨ Key Features & Interactive Workbench

- **Multi-Body Real-Time Race**: Simultaneously releases 4 distinct geometries to observe race mechanics.
- **Energy Partitioning Breakdown**: Live bar charts displaying percentage allocation to rotational vs translational kinetic energy.
- **Friction Threshold Checker**: Calculates minimum required static friction coefficient $\mu_{min} = rac{c}{1+c}	an	heta$ to prevent slipping.
- **Kinematics Telemetry**: Displays instantaneous velocity $v(t)$, elapsed race time, and position along the ramp.

---

## 🔒 Confidentiality, Security & Academic Integrity

This repository adheres strictly to professional security standards, privacy guidelines, and academic integrity policies:

- **Proprietary & Institutional Protection**: Underlying academic curricula, institutional questions, and confidential research data are sanitized and protected under institutional agreements.
- **Environment & Secrets Hygiene**: No private keys, passwords, or personal credentials are hardcoded. API tokens (e.g., Gemini AI or cloud compute) must be supplied via local `.env` files or secure CI/CD secrets.
- **Vulnerability Reporting**: Please refer to [SECURITY.md](SECURITY.md) for instructions on confidential disclosure.

---

## 🛠️ Project Structure & Architecture

```
.
├── src/
│   ├── components/       # UI panels, canvas renderer, sliders & controls
│   ├── utils/            # Physics solvers, RK4 ODE integration, vector math
│   ├── types.ts          # Strongly typed simulation interfaces
│   ├── App.tsx           # Primary application workbench
│   └── main.tsx          # Application root
├── public/               # Static assets & icons
├── metadata.json         # Simulator metadata & capabilities
├── package.json          # Dependencies & build scripts
├── tsconfig.json         # TypeScript compiler configuration
├── vite.config.ts        # Vite bundle & dev server configuration
├── SECURITY.md           # Confidentiality & vulnerability disclosure policy
└── LICENSE               # MIT License
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun** / **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/piashoverflow/Rolling-Motion-Race.git
cd Rolling-Motion-Race

# 2. Install dependencies
npm install

# 3. Configure environment variables (if applicable)
cp .env.example .env

# 4. Launch the local development server
npm run dev
```

Visit `http://localhost:3000` in your browser to interact with the simulation.

### Production Build

```bash
npm run build
npm run preview
```

---

## 👤 Author & Academic Affiliation

**Shamsuddin Piash**  
*B.Sc. in Mechanical Engineering (Graduated March 2025)*  
**Bangladesh University of Engineering and Technology (BUET)**  
Dhaka, Bangladesh

- **Portfolio Website**: [piashoverflow.github.io](https://piashoverflow.github.io)
- **GitHub**: [@piashoverflow](https://github.com/piashoverflow)
- **LinkedIn**: [linkedin.com/in/shamsuddin-piash](https://linkedin.com/in/shamsuddin-piash)
- **Email**: [mohammadshamsuddinpiash0722@gmail.com](mailto:mohammadshamsuddinpiash0722@gmail.com)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

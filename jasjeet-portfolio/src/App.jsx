import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Terminal, Cpu, Sparkles, Shield, Award,
  ExternalLink, GitBranch, ArrowRight, Layers, Zap, CheckCircle2, Star, User
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [interactiveCode, setInteractiveCode] = useState('// Click to execute elite code\nconsole.log("Jasjeet x King Yosef: Ultimate Synergy");');
  const [consoleOutput, setConsoleOutput] = useState('System ready. Initializing 100% dev skill flex...');
  const [copied, setCopied] = useState(false);

  const projects = [
    {
      id: 1,
      title: "SkyNet Neural Engine",
      category: "AI / ML",
      description: "High-performance distributed inference pipeline built with Rust and TypeScript, featuring real-time tensor visualization.",
      tech: ["Rust", "TypeScript", "WebSockets", "Tailwind"],
      stats: "99.9% Efficiency"
    },
    {
      id: 2,
      title: "AuraOS Cloud Workspace",
      category: "Fullstack",
      description: "An ultra-smooth cloud desktop environment operating entirely in the browser with custom window managers and live collaboration.",
      tech: ["React", "Node.js", "WebRTC", "Tailwind"],
      stats: "60 FPS Native feel"
    },
    {
      id: 3,
      title: "Quantum Cipher Protocol",
      category: "Security",
      description: "Post-quantum cryptography key exchange simulator designed for secure enterprise-grade communication channels.",
      tech: ["TypeScript", "WebAssembly", "Go"],
      stats: "Zero-Knowledge"
    },
    {
      id: 4,
      title: "Apex 3D Engine",
      category: "Graphics",
      description: "Custom WebGL rendering pipeline optimized for lightning-fast procedural geometry and lighting calculations.",
      tech: ["Three.js", "GLSL", "React"],
      stats: "120+ FPS Render"
    }
  ];

  const filteredProjects = activeTab === 'all'
    ? projects
    : projects.filter(p => p.category.toLowerCase().includes(activeTab.toLowerCase()));

  const runCodeSnippet = () => {
    setConsoleOutput('>> Executing Jasjeet.exe...\n>> Success: 100% Skill Flex Verified.\n>> Status: Inheriting greatness from KING_YOSEF_.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 text-slate-800 font-sans selection:bg-sky-500 selection:text-white relative overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-xl">
              J
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                JASJEET
              </span>
              <span className="block text-xs font-medium text-sky-600 tracking-wider uppercase">
                Lil Bro of KING_YOSEF_
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-sky-600 transition-colors">About</a>
            <a href="#skills" className="hover:text-sky-600 transition-colors">Dev Flex</a>
            <a href="#projects" className="hover:text-sky-600 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-sky-600 transition-colors">Contact</a>
          </nav>

          <a
            href="#contact"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 transition-all duration-300"
          >
            Let's Talk
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-100/80 border border-sky-200 text-sky-700 text-sm font-medium mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
          <span>Elite Software Engineer & Prodigy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <span className="text-sky-900 font-semibold">KING_YOSEF_'s Lil Bro</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 max-w-5xl leading-[1.1]"
        >
          Engineering the <span className="bg-gradient-to-r from-sky-400 via-sky-600 to-blue-700 bg-clip-text text-transparent">Future</span> in Sky Blue & White.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed"
        >
          Crafting pristine architectures, blazing-fast interfaces, and immersive digital experiences. Carrying the legendary torch alongside <strong className="text-slate-900">KING_YOSEF_</strong>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300 flex items-center space-x-3 group"
          >
            <span>Explore My Work</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#skills"
            className="px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-sky-200 text-slate-700 font-bold text-base shadow-lg hover:bg-sky-50 hover:border-sky-300 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <Zap className="w-5 h-5 text-sky-500" />
            <span>100% Dev Flex</span>
          </a>
        </motion.div>

        {/* Interactive Code Playground / Flex Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-sky-500/30 overflow-hidden text-left"
        >
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="ml-4 text-xs font-mono text-slate-400">jasjeet@elite-terminal ~ portfolio</span>
            </div>
            <button
              onClick={runCodeSnippet}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Run Flex.exe</span>
            </button>
          </div>
          <div className="p-6 font-mono text-sm text-sky-300 space-y-3">
            <div className="text-slate-500">// Jasjeet's Core Profile & Lineage</div>
            <div><span className="text-purple-400">const</span> <span className="text-yellow-300">developer</span> = &#123;</div>
            <div className="pl-6"><span className="text-sky-400">name</span>: <span className="text-emerald-300">"Jasjeet"</span>,</div>
            <div className="pl-6"><span className="text-sky-400">title</span>: <span className="text-emerald-300">"Elite Fullstack Architect"</span>,</div>
            <div className="pl-6"><span className="text-sky-400">mentorAndBro</span>: <span className="text-emerald-300">"KING_YOSEF_"</span>,</div>
            <div className="pl-6"><span className="text-sky-400">powerLevel</span>: <span className="text-amber-400">"100% Dev Flex (Uncapped)"</span>,</div>
            <div className="pl-6"><span className="text-sky-400">stack</span>: [<span className="text-emerald-300">"React"</span>, <span className="text-emerald-300">"TypeScript"</span>, <span className="text-emerald-300">"Rust"</span>, <span className="text-emerald-300">"Tailwind"</span>]</div>
            <div>&#125;;</div>
            <div className="pt-3 text-slate-400 border-t border-slate-800 flex items-center justify-between">
              <span>{consoleOutput}</span>
              <span className="text-xs text-sky-400 animate-pulse">● LIVE</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <User className="w-3.5 h-3.5" />
              <span>About The Prodigy</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Rooted in Excellence. <br />
              <span className="text-sky-600">Elevated by Ambition.</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              As the younger brother of the legendary <strong className="text-slate-900 font-semibold">KING_YOSEF_</strong>, coding isn't just a craft—it's in the bloodline. Jasjeet brings a fresh, uncompromising perspective to software engineering, combining immaculate visual aesthetics (Sky Blue & White minimalism) with bulletproof backend logic.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-black text-sky-600">5+</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Years Coding Mastery</div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-black text-sky-600">50+</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Shipped Systems</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-400 to-blue-600 opacity-30 blur-xl"></div>
            <div className="relative bg-white rounded-3xl border border-sky-200 p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-sky-500" />
                  <span className="font-bold text-slate-800">The Lineage & Cred</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold">Verified Elite</span>
              </div>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>Directly trained and inspired by <strong className="text-slate-900">KING_YOSEF_</strong>.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>Obsessed with pixel-perfection, buttery smooth 60 FPS interfaces, and immaculate clean code.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>Pioneering next-gen web applications with cutting-edge cloud and AI integrations.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dev Flex / Skills Section */}
      <section id="skills" className="py-24 px-6 bg-gradient-to-b from-transparent via-sky-100/50 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>100% Dev Skill Flex</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Weapons of Choice
          </h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            An elite arsenal tested in production, optimized for maximum velocity and zero compromise.
          </p>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "React / Next.js", level: "99%", desc: "Immaculate UI & State Management" },
              { name: "TypeScript", level: "98%", desc: "Strict, bulletproof type safety" },
              { name: "Rust / Wasm", level: "95%", desc: "Blazing fast systems & engines" },
              { name: "Tailwind CSS", level: "100%", desc: "Sky blue gradients & sleek styling" },
              { name: "Node.js / Go", level: "96%", desc: "High throughput backend APIs" },
              { name: "Three.js / WebGL", level: "92%", desc: "Immersive 3D web experiences" },
              { name: "PostgreSQL / Redis", level: "94%", desc: "Lightning-fast data architectures" },
              { name: "Docker / K8s", level: "90%", desc: "Seamless cloud orchestration" }
            ].map((skill, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 rounded-2xl bg-white border border-sky-200/80 shadow-lg shadow-sky-500/5 text-left space-y-3 group hover:border-sky-400 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{skill.name}</span>
                  <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">{skill.level}</span>
                </div>
                <p className="text-xs text-slate-500">{skill.desc}</p>
                <div className="w-full bg-sky-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full" style={{ width: skill.level }}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Masterpieces</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Featured Works
          </h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            Architected and deployed with absolute precision.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {['All', 'AI / ML', 'Fullstack', 'Security', 'Graphics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() === 'all' ? 'all' : tab)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab || (activeTab === 'all' && tab === 'All')
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'bg-white border border-sky-200 text-slate-600 hover:bg-sky-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl border border-sky-200 p-8 shadow-xl shadow-sky-500/5 hover:shadow-2xl hover:border-sky-400 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
                    {project.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {project.stats}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-sky-100 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, i) => (
                    <span key={i} className="text-xs font-mono font-medium px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <a href="#contact" className="inline-flex items-center space-x-2 text-sm font-bold text-sky-600 hover:text-blue-700 group-hover:translate-x-1 transition-all">
                    <span>Live Demo & Source</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <GitBranch className="w-5 h-5 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-sky-500 to-blue-600 rounded-3xl p-12 text-white shadow-2xl shadow-sky-500/30 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Ready to Build Something Legendary?
          </h2>
          <p className="mt-4 text-sky-100 max-w-xl mx-auto text-lg">
            Collaborate with Jasjeet. Backed by the standards of KING_YOSEF_. Let's turn your vision into reality.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:jasjeet@elite-dev.io"
              className="px-8 py-4 rounded-2xl bg-white text-sky-700 font-bold text-base shadow-xl hover:bg-sky-50 hover:scale-105 transition-all duration-300"
            >
              Get in Touch
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-2xl bg-sky-700/50 backdrop-blur-md border border-sky-400/30 text-white font-bold text-base hover:bg-sky-700 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <GitBranch className="w-5 h-5" />
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-sky-100 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Jasjeet. Proudly the lil bro of <strong className="text-slate-700">KING_YOSEF_</strong>.
          </div>
          <div className="flex space-x-6 text-sky-600 font-medium">
            <a href="#about" className="hover:underline">About</a>
            <a href="#skills" className="hover:underline">Dev Flex</a>
            <a href="#projects" className="hover:underline">Projects</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// 1. Inicializar Ícones Lucide
lucide.createIcons();

// 2. Setar Ano Atual no Footer
document.getElementById('year').textContent = new Date().getFullYear();

// 3. Lógica de Scroll Horizontal Nativo
const scrollContainer = document.getElementById('scroll-container');
scrollContainer.addEventListener('wheel', (e) => {
    // Se houver scroll vertical (mouse wheel) e estiver no desktop
    if (window.innerWidth >= 768) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            // Converte vertical para horizontal
            scrollContainer.scrollBy({
                left: e.deltaY * 1.5,
                behavior: 'auto'
            });
        }
    }
}, { passive: false });

// 4. Animações GSAP (ScrollTrigger Responsivo)
gsap.registerPlugin(ScrollTrigger);

const revealElements = document.querySelectorAll('.gs-reveal');
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
    revealElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                scroller: scrollContainer,
                horizontal: true,
                start: "left 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
});

mm.add("(max-width: 767px)", () => {
    revealElements.forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                scroller: scrollContainer,
                horizontal: false,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
});

// 5. Efeito 3D Tilt nos Cards do Portfólio (Vanilla JS)
const cards = document.querySelectorAll('.portfolio-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
});

// 6. Lógica do Modal de Preview
const modal = document.getElementById('portfolio-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');
const iframe = document.getElementById('modal-iframe');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');

function openModal(url, title, category) {
    iframe.src = url;
    modalTitle.textContent = title;
    modalCategory.textContent = category;
    
    modal.classList.remove('hidden');
    // Animação de entrada (Tailwind classes manipulation)
    setTimeout(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

function closeModal() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    
    // Aguarda animação terminar
    setTimeout(() => {
        modal.classList.add('hidden');
        iframe.src = "";
    }, 300);
}

cards.forEach(card => {
    card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        const title = card.getAttribute('data-title');
        const category = card.getAttribute('data-category');
        openModal(url, title, category);
    });
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// 7. Configuração do Three.js para o Logo AURA
const initThreeJS = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    
    const updateCameraZ = () => {
        if (window.innerWidth < 768) {
            camera.position.z = 16;
        } else {
            camera.position.z = 8;
        }
    };
    updateCameraZ();

    // Luzes Metálicas
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);

    // Geometria Torus (Anel)
    const geometry = new THREE.TorusGeometry(3, 0.15, 64, 200);
    
    // Usando PhongMaterial para dar brilho prateado sem precisar de um mapa de ambiente pesado
    const material = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        specular: 0xffffff,
        shininess: 150,
        emissive: 0x111111
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 3; 
    scene.add(ring);

    // Gerar o texto "AURA" direto no 3D para que o anel orbite AO REDOR dele
    function createTextSprite(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 512;
        
        ctx.font = 'bold 200px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow effect no texto
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 20;
        
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        
        // Tamanho do texto no mundo 3D
        sprite.scale.set(6, 3, 1);
        return sprite;
    }

    const textSprite = createTextSprite('AURA');
    scene.add(textSprite);

    // Sistema de Partículas (Estrelas)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700; // Quantidade de partículas
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Posições aleatórias espalhadas
        posArray[i] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04, // Partículas pequenas
        color: 0xffffff, // Totalmente brancas
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Variáveis de Interação
    let isHovered = false;
    let targetScale = 1;
    let mouseX = 0;
    let mouseY = 0;

    // Interação de Mouse
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Raycaster simples (ou aproximação) - Vamos usar aproximação de distância do centro
        const dist = Math.sqrt(mouseX*mouseX + mouseY*mouseY);
        
        if (dist < 0.5 && scrollContainer.scrollLeft < window.innerWidth / 2) {
            isHovered = true;
            targetScale = 1.1;
            material.color.setHex(0xffffff); // Mais brilhante
        } else {
            isHovered = false;
            targetScale = 1;
            material.color.setHex(0xc0c0c0); // Prateado normal
        }
    });

    // Loop de Animação
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Rotação suave
        ring.rotation.x += 0.005;
        ring.rotation.y += 0.01;

        // Animação e Parallax das Partículas
        particlesMesh.rotation.y = elapsedTime * 0.02; // Rotação natural lenta
        particlesMesh.rotation.x += (mouseY * 0.2 - particlesMesh.rotation.x) * 0.05; // Segue o mouse (X)
        particlesMesh.rotation.y += (mouseX * 0.2 - particlesMesh.rotation.y) * 0.05; // Segue o mouse (Y)

        // Efeito de Float
        ring.position.y = Math.sin(elapsedTime * 2) * 0.2;

        // Escala Suave (Lerp)
        ring.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Redimensionamento
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateCameraZ();
    });
};

initThreeJS();

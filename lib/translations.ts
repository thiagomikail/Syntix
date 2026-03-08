import enMessages from '@/messages/en.json';
import ptMessages from '@/messages/pt.json';

export type Language = 'pt' | 'en';

export const translations = {
    pt: {
        ...ptMessages,
        nav: {
            ideation: "Ideação",
            inception: "Inception",
            pitchReady: "Pitch Ready"
        },
        common: {
            close: "Fechar",
            month1: "Mês 1",
            month6: "Mês 6",
            loading: "Carregando...",
            analyzing: "ANALISANDO DADOS...",
            processing: "PROCESSANDO",
            pitchThis: "Criar Pitch",
            immediateActions: "Ações Imediatas",
            realityCheck: "Choque de Realidade",
            theEdge: "O Diferencial"
        },
        hero: {
            title: "Sua Ideia, Analisada em Segundos.",
            subtitle: "Deixe nossa IA dissecar seu modelo de negócios, encontrar falhas e gerar uma estratégia vencedora.",
            description: "Esqueça planos de negócios de 50 páginas. Obtenha insights acionáveis instantaneamente.",
            cta: "Analisar Agora"
        },
        auditor: {
            title: "O Auditor",
            placeholder: "Descreva sua ideia de negócio (ex: Um Uber para passeadores de cães)...",
            submit: "Auditar Ideia",
            analyzing: "ANALISANDO FLUXOS DE DADOS...",
            processing: "PROCESSANDO"
        },
        ideation: {
            title: "O Coletor de Inputs",
            subtitle: "Selecione uma fonte para começar seu processo de ideação.",
            ignite: "Gerar Conceito",
            synthesizing: "Sintetizando...",
            channels: {
                pain: {
                    title: "Fricção & Dor",
                    desc: "Resolva frustrações óbvias que você mesmo enfrenta",
                    topics: ["Gambiarras caras", "Entrada manual de dados", "Processos quebrados", "Suporte ruim"]
                },
                deeptech: {
                    title: "Tecnologia de Fronteira",
                    desc: "Deep tech, pesquisa avançada, novos materiais",
                    topics: ["IA Aplicada", "Biologia Sintética", "Novo Armazenamento de Energia", "Sensores Quânticos"]
                },
                scale: {
                    title: "Escalar & Diferenciar",
                    desc: "Levando modelos existentes a novos nichos ou escalas",
                    topics: ["X para Y", "SaaS Vertical", "Desmembramento de plataformas", "Comoditização de serviços"]
                },
                market: {
                    title: "Tendências Emergentes",
                    desc: "Atração do mercado, mudanças regulatórias, macro",
                    topics: ["Mudanças demográficas", "Novas leis de compliance", "Infraestrutura remota", "Ferramentas para criadores"]
                }
            }
        },
        inception: {
            title: "SISTEMA OPERACIONAL DE IDEIAS",
            subtitle: "O Logic Engine classificará sua ideia em um dos 5 Caminhos Empreendedores.",
            placeholder: "Descreva sua ideia...",
            analyze: "Classificar",
            spectrum: "Espectro Empreendedor",
            sections: {
                marketResearch: "Pesquisa de Mercado",
                strategicRoadmap: "Roadmap Estratégico",
                tam: "TAM (Total Endereçável)",
                sam: "SAM (Disponível)",
                som: "SOM (Obtível)",
                niche: "Estratégia de Nicho",
                validation: "Validação",
                systems: "Sistemas"
            },
            paths: {
                micro: {
                    label: "Caminho 1: O Micro Cash-Flow",
                    description: "Baixo capital, alta margem, focado em 'solo-founder'."
                },
                specialist: {
                    label: "Caminho 2: O Especialista Escalável",
                    description: "Domínio de nicho B2B, processo de vendas científico."
                },
                venture: {
                    label: "Caminho 3: O Motor de Venture",
                    description: "Alto crescimento (>7%/semana), escala de VC, grande mercado."
                },
                paradigm: {
                    label: "Caminho 4: O Mudador de Paradigma",
                    description: "Monopólio Zero a Um, hard tech, efeitos de rede."
                },
                dead_end: {
                    label: "Caminho 5: O Beco Sem Saída",
                    description: "Fundamentalmente falho ou resolvido por alternativas gratuitas."
                }
            }
        },
        irl: {
            title: "Pontuação IRL",
            score: "Pontuação"
        },
        radar: {
            title: "Radar de Viabilidade"
        },
        board: {
            title: "O Conselho",
            subtitle: "Feedback de Personas de IA",
            skeptic: "O Cético",
            growth: "O Hacker de Crescimento",
            cfo: "O CFO"
        }
    },
    en: {
        ...enMessages,
        nav: {
            ideation: "Ideation",
            inception: "Inception",
            pitchReady: "Pitch Ready"
        },
        common: {
            close: "Close",
            month1: "Month 1",
            month6: "Month 6",
            loading: "Loading...",
            analyzing: "ANALYZING DATA...",
            processing: "PROCESSING",
            pitchThis: "Pitch This Idea",
            immediateActions: "Immediate Actions",
            realityCheck: "Reality Check",
            theEdge: "The Edge"
        },
        hero: {
            title: "Your Idea, Analyzed in Seconds.",
            subtitle: "Let our AI dissect your business model, find flaws, and generate a winning strategy.",
            description: "Forget 50-page business plans. Get actionable insights instantly.",
            cta: "Analyze Now"
        },
        auditor: {
            title: "The Auditor",
            placeholder: "Pitch your business idea (e.g., Uber for dog walkers)...",
            submit: "Audit Idea",
            analyzing: "ANALYZING DATA STREAMS...",
            processing: "PROCESSING"
        },
        ideation: {
            title: "The Input Manifold",
            subtitle: "Select a source to begin your ideation process.",
            ignite: "Ignite Concept",
            synthesizing: "Synthesizing...",
            channels: {
                pain: {
                    title: "Friction & Pain",
                    desc: "Scratch your own itch, solve clear frustrations",
                    topics: ["Expensive workarounds", "Manual data entry", "Broken workflows", "Bad customer support"]
                },
                deeptech: {
                    title: "Frontier Tech",
                    desc: "Deep tech, advanced research, new materials",
                    topics: ["Applied AI", "Synthetic Biology", "New Energy Storage", "Quantum Sensors"]
                },
                scale: {
                    title: "Scale & Differentiate",
                    desc: "Taking existing models to new niches or scales",
                    topics: ["X for Y", "Vertical SaaS", "Unbundling platforms", "Commoditize services"]
                },
                market: {
                    title: "Emerging Trends",
                    desc: "Market pull, changing regulations, macro shifts",
                    topics: ["Demographic shifts", "New compliance laws", "Remote work infra", "Creator tooling"]
                }
            }
        },
        inception: {
            title: "IDEA OPERATING SYSTEM",
            subtitle: "The Logic Engine will classify your idea into one of the 5 Entrepreneurial Paths.",
            placeholder: "Describe your business idea...",
            analyze: "Classify",
            spectrum: "Entrepreneurs Spectrum",
            sections: {
                marketResearch: "Market Research",
                strategicRoadmap: "Strategic Roadmap",
                tam: "TAM (Total Addressable)",
                sam: "SAM (Serviceable)",
                som: "SOM (Obtainable)",
                niche: "Niche Strategy",
                validation: "Validation",
                systems: "Systems"
            },
            paths: {
                micro: {
                    label: "Path 1: The Cash-Flow Micro",
                    description: "Low capital, high margin, solo-founder focused."
                },
                specialist: {
                    label: "Path 2: The Scalable Specialist",
                    description: "B2B niche dominance, scientific sales process."
                },
                venture: {
                    label: "Path 3: The Venture Engine",
                    description: "High growth (>7%/week), VC-scale, large market."
                },
                paradigm: {
                    label: "Path 4: The Paradigm Shifter",
                    description: "Zero to One monopoly, hard tech, network effects."
                },
                dead_end: {
                    label: "Path 5: The Dead End",
                    description: "Fundamentally flawed or solved by free alternatives."
                }
            }
        },
        irl: {
            title: "IRL Score",
            score: "Score"
        },
        radar: {
            title: "Feasibility Radar"
        },
        board: {
            title: "The Board",
            subtitle: "AI Persona Feedback",
            skeptic: "The Skeptic",
            growth: "The Growth Hacker",
            cfo: "The CFO"
        }
    }
};

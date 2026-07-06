/**
 * sse.js — Cliente SSE para o LiveHeader
 * Conecta a /api/live e atualiza o DOM com estado da sessão.
 * Versão refinada: suporta phase badges com cor, indicador AO VIVO.
 */
(function() {
  'use strict';

  const INDICATOR     = document.getElementById('live-indicator');
  const PHASE_BADGE   = document.getElementById('live-phase-badge');
  const TURN_EL       = document.getElementById('live-turn');
  const SPEC_EL       = document.getElementById('live-spec');
  const GATES_EL      = document.getElementById('live-gates');
  const NO_SESSION    = document.getElementById('live-no-session');

  // Mapeia fase → classe CSS do badge
  const PHASE_CLASSES = {
    constitution: 'phase-constitution',
    specify:      'phase-specify',
    design:       'phase-design',
    plan:         'phase-plan',
    execute:      'phase-execute',
    validate:     'phase-validate',
    reflect:      'phase-reflect',
  };

  // Mapeia fase → label em português
  const PHASE_LABELS = {
    constitution: 'Constituição',
    specify:      'Especificação',
    design:       'Design',
    plan:         'Plano',
    execute:      'Execução',
    validate:     'Validação',
    reflect:      'Reflexão',
  };

  function updatePhase(phase) {
    if (!PHASE_BADGE) return;
    const normalized = (phase || '').toLowerCase();

    // Remove todas as classes de fase
    PHASE_BADGE.className = 'phase-badge';
    // Adiciona a classe específica se existir
    if (PHASE_CLASSES[normalized]) {
      PHASE_BADGE.classList.add(PHASE_CLASSES[normalized]);
      PHASE_BADGE.textContent = PHASE_LABELS[normalized] || phase;
    } else {
      PHASE_BADGE.textContent = phase || '—';
    }
  }

  function updateIndicator(active) {
    if (!INDICATOR) return;
    if (active) {
      INDICATOR.innerHTML = '<span class="live-dot"></span> AO VIVO';
    } else {
      INDICATOR.innerHTML = '⏸ AGUARDANDO';
    }
  }

  function connect() {
    try {
      eventSource = new EventSource('/api/live');
    } catch (e) {
      // Falha na conexão SSE (ex.: servidor não iniciado)
      return;
    }

    eventSource.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);

        if (!data.session_active) {
          if (NO_SESSION) NO_SESSION.style.display = 'block';
          updateIndicator(false);
          updatePhase(null);
          if (TURN_EL)  TURN_EL.textContent = '—';
          if (SPEC_EL)  SPEC_EL.textContent = '—';
          if (GATES_EL) GATES_EL.textContent = '—';
          return;
        }

        if (NO_SESSION) NO_SESSION.style.display = 'none';
        updateIndicator(true);

        // Fase com badge colorido
        updatePhase(data.phase);

        // Turno
        if (TURN_EL) {
          TURN_EL.textContent = data.turn + '/' + (data.max_turns || '?');
        }

        // Spec
        if (SPEC_EL) {
          SPEC_EL.textContent = data.spec || '—';
        }

        // GATEs
        if (GATES_EL && data.gates) {
          const g = data.gates;
          const parts = [];
          if (g.spec)   parts.push('spec:' + g.spec);
          if (g.design) parts.push('design:' + g.design);
          if (g.plan)   parts.push('plan:' + g.plan);
          GATES_EL.textContent = parts.join(' · ') || '—';
        }
      } catch (_) {
        // ignora JSON mal formatado
      }
    };

    eventSource.onerror = function() {
      // Reconecta automaticamente (EventSource faz isso nativamente)
      updateIndicator(false);
      if (NO_SESSION) NO_SESSION.style.display = 'block';
    };
  }

  // Iniciar conexão SSE
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();

export {}; // make this a valid ES module for Astro/Vite bundling

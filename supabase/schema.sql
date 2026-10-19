-- ─────────────────────────────────────────────────────────────
-- Ideoryx — Supabase Initial Schema & Security Rules
-- PostgreSQL + RLS + pgvector (optional extension)
-- ─────────────────────────────────────────────────────────────

-- 1. Enable UUID & Vector extensions (if available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pgvector if supported in environment (commented if running locally without extension)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Helper function to automatically update `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- Profiles (mirrors auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    mode TEXT DEFAULT 'builder',
    mission TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    capacity_hours INT DEFAULT 40,
    business_focus TEXT[] DEFAULT '{}',
    growth_focus TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Workspaces
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    workspace_type TEXT NOT NULL DEFAULT 'product', -- 'product' | 'client'
    stage TEXT NOT NULL DEFAULT 'idea',             -- 'idea' | 'mvp' | 'growth'
    status TEXT NOT NULL DEFAULT 'active',          -- 'active' | 'archived'
    tech_stack TEXT[] DEFAULT '{}',
    readiness_score INT DEFAULT 0,
    checklists JSONB DEFAULT '[]'::jsonb,
    stage_history JSONB DEFAULT '[]'::jsonb,
    organization_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);

-- ─────────────────────────────────────────────────────────────
-- Tasks
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'feature',           -- 'feature' | 'bug' | 'infra' | 'research'
    priority TEXT NOT NULL DEFAULT 'medium',        -- 'low' | 'medium' | 'high' | 'urgent'
    status TEXT NOT NULL DEFAULT 'todo',            -- 'todo' | 'in_progress' | 'done' | 'blocked'
    assigned_to TEXT,
    source_run_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_workspace ON public.tasks(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ─────────────────────────────────────────────────────────────
-- Decisions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context TEXT,
    options_considered JSONB DEFAULT '[]'::jsonb,
    chosen_option TEXT,
    rationale TEXT,
    tradeoffs TEXT,
    risks TEXT,
    source_run_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_workspace ON public.decisions(user_id, workspace_id);

-- ─────────────────────────────────────────────────────────────
-- Signals
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'performance',   -- 'performance' | 'friction' | 'churn_risk' | 'feature_gap' | 'technical_debt'
    severity TEXT NOT NULL DEFAULT 'medium',        -- 'low' | 'medium' | 'high' | 'critical'
    status TEXT NOT NULL DEFAULT 'new',             -- 'new' | 'investigating' | 'promoted' | 'resolved' | 'dismissed'
    source TEXT NOT NULL DEFAULT 'manual',
    source_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_user_workspace ON public.signals(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);

-- ─────────────────────────────────────────────────────────────
-- Opportunities
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'performance',
    status TEXT NOT NULL DEFAULT 'open',            -- 'open' | 'accepted' | 'rejected' | 'converted'
    score NUMERIC DEFAULT 0,
    scoring_breakdown JSONB DEFAULT '{}'::jsonb,
    source_signal_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_workspace ON public.opportunities(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON public.opportunities(score DESC);

-- ─────────────────────────────────────────────────────────────
-- Playbooks
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    steps JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    prompt_template TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);

-- ─────────────────────────────────────────────────────────────
-- Agent Runs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    project_id TEXT,
    lead_id UUID,
    agent_role TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    input_goal TEXT NOT NULL,
    context_tags TEXT[] DEFAULT '{}',
    output JSONB DEFAULT '{}'::jsonb,
    next_best_action TEXT,
    status TEXT NOT NULL DEFAULT 'pending',         -- 'pending' | 'completed' | 'failed'
    duration_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_user_workspace ON public.agent_runs(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON public.agent_runs(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Memories (Agent Context & Vector Ready)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'fact',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);

-- ─────────────────────────────────────────────────────────────
-- Leads & Proposals (Freelance Module)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    estimated_value NUMERIC DEFAULT 0,
    scope_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Triggers for `updated_at`
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_update_timestamp ON public.%I;
            CREATE TRIGGER trg_update_timestamp
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Profiles: user owns row where id == auth.uid()
CREATE POLICY "Users can view and update own profile" 
    ON public.profiles FOR ALL 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- Standard user-owned tables
CREATE POLICY "Users own workspaces" ON public.workspaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own decisions" ON public.decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own signals" ON public.signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own playbooks" ON public.playbooks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own agent_runs" ON public.agent_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own memories" ON public.memories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own leads" ON public.leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own proposals" ON public.proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Automatic Profile Creation on Signup
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

insert into public.modules (title, slug, description, position, is_published)
values
  ('Fundamentos do E-AIMS', 'fundamentos-do-e-aims', 'Introducao ao uso do portal e aos objetivos educacionais.', 0, true),
  ('Metodologia aplicada', 'metodologia-aplicada', 'Aulas sobre estrutura, praticas e acompanhamento.', 1, true),
  ('Trilhas complementares', 'trilhas-complementares', 'Conteudos adicionais para aprofundamento.', 2, false)
on conflict (slug) do nothing;

insert into public.lessons (module_id, title, slug, description, position, video_provider, video_uid, duration_seconds, is_published)
select id, 'Boas-vindas ao portal', 'boas-vindas-ao-portal', 'Visao geral do ambiente de aprendizagem.', 0, 'cloudflare_stream', 'demo-video-uid', 420, true
from public.modules where slug = 'fundamentos-do-e-aims'
on conflict (module_id, slug) do nothing;

insert into public.lesson_materials (lesson_id, title, material_type, external_url, position, is_published)
select id, 'Guia de estudo do modulo', 'link', 'https://example.com/material-demo', 0, true
from public.lessons where slug = 'boas-vindas-ao-portal'
on conflict do nothing;

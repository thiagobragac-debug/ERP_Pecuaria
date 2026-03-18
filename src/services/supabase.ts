
import { createClient } from '@supabase/supabase-js';

// These would normally be in an .env file
const supabaseUrl = 'https://octauxlnxrygyjlhtrxu.supabase.co';
const supabaseKey = 'sb_publishable_ySWNMJ_JhW8y5eKHDO_AbQ_IJe8t6uP';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * PROPOSED DATABASE SCHEMA (PHASE 5):
 * 
 * TABLE: animais
 * - id (uuid, pk)
 * - brinco (text)
 * - sexo (char)
 * - raca (text)
 * - lote_id (uuid, fk)
 * - pasto_id (uuid, fk)
 * - data_nasc (date)
 * - custo_aquisicao (decimal)
 * 
 * TABLE: lotes
 * - id (uuid, pk)
 * - nome (text)
 * - status (text)
 * 
 * TABLE: registros_sanitarios
 * - id (uuid, pk)
 * - animal_id (uuid, fk, nullable)
 * - lote_id (uuid, fk, nullable)
 * - tipo (text)
 * - data (date)
 * - custo_total (decimal)
 * 
 * TABLE: dietas
 * - id (uuid, pk)
 * - nome (text)
 * - custo_por_cab (decimal)
 * - lote_id (uuid, fk)
 */

import { createClient } from '../utils/supabase/client'

export interface DengueCheckData {
  user_id?: string | null
  kdema: 'Iya' | 'Tidak'
  ddema: number
  suhun: number
  ulabo: 'Sudah' | 'Belum'
  jwbcs: number
  hemog: number
  hemat: number
  jplat: number
  skpla: 'Iya' | 'Tidak'
  nymat: 'Iya' | 'Tidak'
  nysen: 'Iya' | 'Tidak'
  rsmul: 'Iya' | 'Tidak'
  hinfm: 'Iya' | 'Tidak'
  nyper: 'Iya' | 'Tidak'
  mumun: 'Iya' | 'Tidak'
  mdiar: 'Iya' | 'Tidak'
  prediction: 0 | 1
  probability: number
  model_used: string
}

export interface DengueCheckRecord extends DengueCheckData {
  id: string
  created_at: string
}

/**
 * Save dengue check result to database
 */
export async function saveDengueCheck(data: DengueCheckData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    // Prepare data for insertion
    // Round numeric values to avoid precision overflow
    // PostgreSQL numeric type has precision limits
    const checkData = {
      user_id: user?.id || null,
      kdema: data.kdema,
      ddema: Math.min(Math.max(Math.round(data.ddema), 0), 365), // Clamp between 0-365 days
      suhun: Math.min(Math.max(Math.round(data.suhun * 10) / 10, 0), 50), // Clamp temp 0-50°C, 1 decimal
      ulabo: data.ulabo,
      jwbcs: Math.min(Math.max(Math.round(data.jwbcs * 10) / 10, 0), 30), // Clamp WBC 0-30, 1 decimal
      hemog: Math.min(Math.max(Math.round(data.hemog * 10) / 10, 0), 30), // Clamp hemoglobin 0-30, 1 decimal
      hemat: Math.min(Math.max(Math.round(data.hemat), 0), 100), // Clamp hematocrit 0-100%
      jplat: Math.min(Math.max(Math.round(data.jplat), 0), 1000), // Clamp platelet 0-1000
      skpla: data.skpla,
      nymat: data.nymat,
      nysen: data.nysen,
      rsmul: data.rsmul,
      hinfm: data.hinfm,
      nyper: data.nyper,
      mumun: data.mumun,
      mdiar: data.mdiar,
      prediction: data.prediction,
      probability: Math.min(Math.max(Math.round(data.probability * 10) / 10, 0), 100), // Clamp 0-100%, 1 decimal
      model_used: data.model_used.substring(0, 50) // Limit model name to 50 chars
    }

    const { data: result, error } = await supabase
      .from('dengue_checks')
      .insert([checkData])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message || 'Unknown database error' }
    }

    return { success: true, id: result.id }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get dengue check history for current user
 */
export async function getDengueCheckHistory(): Promise<{ success: boolean; data?: DengueCheckRecord[]; error?: string }> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('dengue_checks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get single dengue check by ID
 */
export async function getDengueCheckById(id: string): Promise<{ success: boolean; data?: DengueCheckRecord; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('dengue_checks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Delete dengue check by ID
 */
export async function deleteDengueCheck(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('dengue_checks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own records

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

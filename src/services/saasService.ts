import { supabase } from './supabase';
import { SaaSPlan, SaasSubscription, SaaSOrganization, SaasMember } from '../types';

export const saasService = {
  async getPlans(): Promise<SaaSPlan[]> {
    const { data, error } = await supabase
      .from('saas_plans')
      .select('*')
      .eq('is_active', true)
      .order('preco_mensal', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserOrganizations(): Promise<SaaSOrganization[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saas_organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrganizationMembers(orgId: string): Promise<SaasMember[]> {
    const { data, error } = await supabase
      .from('saas_organization_members')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('organization_id', orgId);

    if (error) throw error;
    return data || [];
  },

  async getCurrentSubscription(orgId?: string): Promise<{ subscription: SaasSubscription, plan: SaaSPlan, organization: SaaSOrganization } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let targetOrgId = orgId;

    if (!targetOrgId) {
      // If no org specified, find the first one or the one where user is owner
      const { data: orgs } = await supabase.from('saas_organizations').select('id').limit(1).single();
      if (!orgs) return null;
      targetOrgId = orgs.id;
    }

    const { data: orgData, error: orgError } = await supabase
      .from('saas_organizations')
      .select('*')
      .eq('id', targetOrgId)
      .single();

    if (orgError) return null;

    const { data: subData, error: subError } = await supabase
      .from('saas_subscriptions')
      .select('*, plan:saas_plans(*)')
      .eq('organization_id', orgData.id)
      .single();

    if (subError) return null;

    return {
      subscription: subData,
      plan: subData.plan,
      organization: orgData
    };
  },

  async checkLimit(type: 'animais' | 'usuarios', currentCount: number, orgId?: string): Promise<boolean> {
    const data = await this.getCurrentSubscription(orgId);
    if (!data) return true;

    const limit = type === 'animais' ? data.plan.limite_animais : data.plan.limite_usuarios;
    if (limit === null) return true;

    return currentCount < limit;
  },

  async getSaaSMetrics(): Promise<{ mrr: number, active_subscriptions: number, total_organizations: number, current_month_revenue: number }> {
    const { data, error } = await supabase
      .from('view_saas_metrics')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async getBillingHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('saas_billing_history')
      .select('*, organization:saas_organizations(nome), plan:saas_plans(nome)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPaymentConfig(): Promise<any> {
    const { data, error } = await supabase
      .from('saas_configs')
      .select('value')
      .eq('key', 'payment_settings')
      .single();

    if (error) throw error;
    return data.value;
  },

  async updatePaymentConfig(config: any): Promise<void> {
    const { error } = await supabase
      .from('saas_configs')
      .update({ value: config, updated_at: new Date().toISOString() })
      .eq('key', 'payment_settings');

    if (error) throw error;
  },

  async inviteMember(email: string, role: string, orgId: string): Promise<void> {
    // In a real SaaS, this would send an email and create a pending record
    // For now, we simulate the database entry
    const { error } = await supabase
      .from('saas_invitations')
      .insert({
        email,
        role,
        organization_id: orgId,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async updateMemberRole(memberId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('saas_organization_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) throw error;
  }
};

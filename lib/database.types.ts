// Authoritative Supabase database types for LetHub.
// Source: live Supabase project `gejxrnreuafnyzwrchvy` (PostgREST), schema as of migrations 001-008.
// Regenerate after every accepted schema migration with:
//   npx supabase gen types typescript --project-id gejxrnreuafnyzwrchvy --schema public > lib/database.types.ts
// Do not hand-edit table shapes to make the compiler pass; resolve schema/code mismatches in application code instead.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_subscriptions: {
        Row: {
          account_id: string | null
          billing_cycle: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_slug: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_slug?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          account_id?: string | null
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_slug?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      accounting_connections: {
        Row: {
          account_id: string | null
          account_name: string | null
          agency_id: string | null
          api_connected: boolean | null
          created_at: string | null
          error_message: string | null
          id: string
          last_sync: string | null
          provider: string
          sync_config: Json | null
          sync_status: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          agency_id?: string | null
          api_connected?: boolean | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          sync_config?: Json | null
          sync_status?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          agency_id?: string | null
          api_connected?: boolean | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          sync_config?: Json | null
          sync_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_connections_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      accounting_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string | null
          error_message: string | null
          id: string
          provider: string
          records_synced: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id?: string | null
          error_message?: string | null
          id?: string
          provider?: string
          records_synced?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string | null
          error_message?: string | null
          id?: string
          provider?: string
          records_synced?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "accounting_connections"
            referencedColumns: ["id"]
          }
        ]
      }
      acquisition_deals: {
        Row: {
          agency_id: string | null
          bedrooms: number | null
          converted_to_landlord_id: string | null
          converted_to_property_id: string | null
          created_at: string | null
          crm_lead_id: string | null
          email: string | null
          estimated_fees: number | null
          estimated_rent: number | null
          id: string
          is_active: boolean | null
          management_fee_percent: number | null
          name: string
          notes: string | null
          phone: string | null
          property_address: string
          property_city: string | null
          property_postcode: string | null
          property_type: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          bedrooms?: number | null
          converted_to_landlord_id?: string | null
          converted_to_property_id?: string | null
          created_at?: string | null
          crm_lead_id?: string | null
          email?: string | null
          estimated_fees?: number | null
          estimated_rent?: number | null
          id?: string
          is_active?: boolean | null
          management_fee_percent?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          property_address?: string
          property_city?: string | null
          property_postcode?: string | null
          property_type?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          bedrooms?: number | null
          converted_to_landlord_id?: string | null
          converted_to_property_id?: string | null
          created_at?: string | null
          crm_lead_id?: string | null
          email?: string | null
          estimated_fees?: number | null
          estimated_rent?: number | null
          id?: string
          is_active?: boolean | null
          management_fee_percent?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          property_address?: string
          property_city?: string | null
          property_postcode?: string | null
          property_type?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_deals_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_deals_converted_to_landlord_id_fkey"
            columns: ["converted_to_landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_deals_converted_to_property_id_fkey"
            columns: ["converted_to_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_deals_crm_lead_id_fkey"
            columns: ["crm_lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          linked_id: string | null
          linked_table: string | null
          priority: string
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          linked_id?: string | null
          linked_table?: string | null
          priority?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          linked_id?: string | null
          linked_table?: string | null
          priority?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agencies: {
        Row: {
          created_at: string
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          name: string
          primary_colour: string | null
          secondary_colour: string | null
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_colour?: string | null
          secondary_colour?: string | null
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_colour?: string | null
          secondary_colour?: string | null
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          agency_id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          agency_id: string
          profile_id: string
          role?: string | null
        }
        Update: {
          agency_id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      anti_discrimination_checks: {
        Row: {
          check_type: string
          checked_on: string | null
          created_at: string | null
          id: string
          notes: string | null
          passed: boolean | null
          property_id: string | null
          tenancy_id: string | null
        }
        Insert: {
          check_type?: string
          checked_on?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          passed?: boolean | null
          property_id?: string | null
          tenancy_id?: string | null
        }
        Update: {
          check_type?: string
          checked_on?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          passed?: boolean | null
          property_id?: string | null
          tenancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_discrimination_checks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_discrimination_checks_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      api_audit_log: {
        Row: {
          action: string
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          module: string
          response_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          action?: string
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          module?: string
          response_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          module?: string
          response_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_audit_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          agency_id: string | null
          created_at: string
          created_by: string
          id: string
          is_revoked: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: Json
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_revoked?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: Json
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_revoked?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      arrears_cases: {
        Row: {
          created_at: string
          id: string
          last_contact: string | null
          last_reminder_sent: string | null
          notes: string | null
          payment_plan_amount: number | null
          payment_plan_frequency: string | null
          property_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["arrear_status"]
          tenancy_id: string
          tenant_id: string
          total_owed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_contact?: string | null
          last_reminder_sent?: string | null
          notes?: string | null
          payment_plan_amount?: number | null
          payment_plan_frequency?: string | null
          property_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["arrear_status"]
          tenancy_id: string
          tenant_id: string
          total_owed: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_contact?: string | null
          last_reminder_sent?: string | null
          notes?: string | null
          payment_plan_amount?: number | null
          payment_plan_frequency?: string | null
          property_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["arrear_status"]
          tenancy_id?: string
          tenant_id?: string
          total_owed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "arrears_cases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrears_cases_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrears_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_events: {
        Row: {
          agency_id: string | null
          amount: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          plan_id: string | null
          profile_id: string | null
          stripe_event_id: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          agency_id?: string | null
          amount?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          profile_id?: string | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          profile_id?: string | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      compliance_documents: {
        Row: {
          agency_id: string | null
          certificate_number: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          document_type: string
          expiry_date: string | null
          file_size: number | null
          id: string
          issued_date: string | null
          notes: string | null
          processed: boolean | null
          property_id: string | null
          result: string | null
          updated_at: string | null
          uploaded_file_url: string | null
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          agency_id?: string | null
          certificate_number?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          id?: string
          issued_date?: string | null
          notes?: string | null
          processed?: boolean | null
          property_id?: string | null
          result?: string | null
          updated_at?: string | null
          uploaded_file_url?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          agency_id?: string | null
          certificate_number?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          id?: string
          issued_date?: string | null
          notes?: string | null
          processed?: boolean | null
          property_id?: string | null
          result?: string | null
          updated_at?: string | null
          uploaded_file_url?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      compliance_obligation_types: {
        Row: {
          code: string
          description: string | null
          document_kind: Database["public"]["Enums"]["document_kind"]
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          document_kind: Database["public"]["Enums"]["document_kind"]
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          document_kind?: Database["public"]["Enums"]["document_kind"]
          name?: string
        }
        Relationships: []
      }
      contractor_jobs: {
        Row: {
          assigned_at: string
          completed_at: string | null
          contractor_id: string
          contractor_notes: string | null
          created_at: string
          id: string
          maintenance_job_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["contractor_job_status"]
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          contractor_id: string
          contractor_notes?: string | null
          created_at?: string
          id?: string
          maintenance_job_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["contractor_job_status"]
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          contractor_id?: string
          contractor_notes?: string | null
          created_at?: string
          id?: string
          maintenance_job_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["contractor_job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_jobs_maintenance_job_id_fkey"
            columns: ["maintenance_job_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      contractor_performance: {
        Row: {
          average_completion_days: number | null
          average_response_hours: number | null
          business_name: string
          combined_score: number | null
          contractor_id: string | null
          created_at: string
          documentation_score: number | null
          emergency_response_time_hours: number | null
          id: string
          invoice_accuracy_rate: number | null
          jobs_cancelled: number
          jobs_completed: number
          last_job_date: string | null
          on_time_rate: number | null
          quality_score: number | null
          rating: number | null
          reliability_score: number | null
          repeat_business_rate: number | null
          review_count: number
          speed_score: number | null
          total_jobs: number
          trade: string
          updated_at: string
        }
        Insert: {
          average_completion_days?: number | null
          average_response_hours?: number | null
          business_name?: string
          combined_score?: number | null
          contractor_id?: string | null
          created_at?: string
          documentation_score?: number | null
          emergency_response_time_hours?: number | null
          id?: string
          invoice_accuracy_rate?: number | null
          jobs_cancelled?: number
          jobs_completed?: number
          last_job_date?: string | null
          on_time_rate?: number | null
          quality_score?: number | null
          rating?: number | null
          reliability_score?: number | null
          repeat_business_rate?: number | null
          review_count?: number
          speed_score?: number | null
          total_jobs?: number
          trade?: string
          updated_at?: string
        }
        Update: {
          average_completion_days?: number | null
          average_response_hours?: number | null
          business_name?: string
          combined_score?: number | null
          contractor_id?: string | null
          created_at?: string
          documentation_score?: number | null
          emergency_response_time_hours?: number | null
          id?: string
          invoice_accuracy_rate?: number | null
          jobs_cancelled?: number
          jobs_completed?: number
          last_job_date?: string | null
          on_time_rate?: number | null
          quality_score?: number | null
          rating?: number | null
          reliability_score?: number | null
          repeat_business_rate?: number | null
          review_count?: number
          speed_score?: number | null
          total_jobs?: number
          trade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_performance_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contractor_profiles: {
        Row: {
          address: string | null
          business_name: string
          completed_jobs: number | null
          contact_name: string
          created_at: string
          email: string | null
          gas_safe_reg_number: string | null
          hourly_rate: number | null
          id: string
          insurance_expiry: string | null
          napit_reg_number: string | null
          niceic_reg_number: string | null
          notes: string | null
          phone: string | null
          profile_id: string | null
          public_liability_amount: string | null
          rating: number | null
          status: Database["public"]["Enums"]["contractor_status"]
          trade: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string
          completed_jobs?: number | null
          contact_name?: string
          created_at?: string
          email?: string | null
          gas_safe_reg_number?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          napit_reg_number?: string | null
          niceic_reg_number?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          public_liability_amount?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["contractor_status"]
          trade?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          completed_jobs?: number | null
          contact_name?: string
          created_at?: string
          email?: string | null
          gas_safe_reg_number?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          napit_reg_number?: string | null
          niceic_reg_number?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          public_liability_amount?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["contractor_status"]
          trade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contractor_quotes: {
        Row: {
          account_id: string | null
          amount: number | null
          approved_at: string | null
          contractor_id: string | null
          created_at: string | null
          description: string | null
          id: string
          maintenance_action_id: string | null
          owner_id: string | null
          owner_reviewed_at: string | null
          property_id: string | null
          quote_file_url: string | null
          quote_number: string
          rejected_at: string | null
          rejection_reason: string | null
          requested_at: string | null
          status: string
          submitted_at: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          account_id?: string | null
          amount?: number | null
          approved_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_action_id?: string | null
          owner_id?: string | null
          owner_reviewed_at?: string | null
          property_id?: string | null
          quote_file_url?: string | null
          quote_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          account_id?: string | null
          amount?: number | null
          approved_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_action_id?: string | null
          owner_id?: string | null
          owner_reviewed_at?: string | null
          property_id?: string | null
          quote_file_url?: string | null
          quote_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_quotes_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_quotes_maintenance_action_id_fkey"
            columns: ["maintenance_action_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_leads: {
        Row: {
          agency_id: string | null
          assigned_to: string | null
          company: string | null
          created_at: string | null
          email: string | null
          estimated_value: number | null
          expected_monthly_rent: number | null
          follow_up_date: string | null
          id: string
          is_active: boolean | null
          last_contacted_at: string | null
          lead_type: string
          lost_reason: string | null
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          pipeline_stage: string
          properties_count: number | null
          source: string | null
          updated_at: string | null
          won_date: string | null
        }
        Insert: {
          agency_id?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_monthly_rent?: number | null
          follow_up_date?: string | null
          id?: string
          is_active?: boolean | null
          last_contacted_at?: string | null
          lead_type?: string
          lost_reason?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_stage?: string
          properties_count?: number | null
          source?: string | null
          updated_at?: string | null
          won_date?: string | null
        }
        Update: {
          agency_id?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_monthly_rent?: number | null
          follow_up_date?: string | null
          id?: string
          is_active?: boolean | null
          last_contacted_at?: string | null
          lead_type?: string
          lost_reason?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_stage?: string
          properties_count?: number | null
          source?: string | null
          updated_at?: string | null
          won_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      document_templates: {
        Row: {
          agency_id: string | null
          content: string
          created_at: string | null
          description: string | null
          document_type: string
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          document_type?: string
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          document_type?: string
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          created_at: string
          expires_on: string | null
          file_size: number | null
          id: string
          issued_on: string | null
          kind: Database["public"]["Enums"]["document_kind"]
          property_id: string | null
          served_on: string | null
          served_to: string | null
          storage_path: string
          tenancy_id: string | null
        }
        Insert: {
          created_at?: string
          expires_on?: string | null
          file_size?: number | null
          id?: string
          issued_on?: string | null
          kind: Database["public"]["Enums"]["document_kind"]
          property_id?: string | null
          served_on?: string | null
          served_to?: string | null
          storage_path: string
          tenancy_id?: string | null
        }
        Update: {
          created_at?: string
          expires_on?: string | null
          file_size?: number | null
          id?: string
          issued_on?: string | null
          kind?: Database["public"]["Enums"]["document_kind"]
          property_id?: string | null
          served_on?: string | null
          served_to?: string | null
          storage_path?: string
          tenancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_served_to_fkey"
            columns: ["served_to"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      email_queue: {
        Row: {
          agency_id: string | null
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_data: Json | null
          template_name: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_data?: Json | null
          template_name?: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_data?: Json | null
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_offices: {
        Row: {
          address: string | null
          agency_id: string | null
          city: string
          compliance_rate: number | null
          created_at: string | null
          id: string
          maintenance_load: number | null
          manager_email: string | null
          manager_name: string
          name: string
          portfolio_size: number | null
          portfolio_value: number | null
          postcode: string
          revenue_monthly: number | null
          staff_count: number | null
          status: string | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          city?: string
          compliance_rate?: number | null
          created_at?: string | null
          id?: string
          maintenance_load?: number | null
          manager_email?: string | null
          manager_name?: string
          name?: string
          portfolio_size?: number | null
          portfolio_value?: number | null
          postcode?: string
          revenue_monthly?: number | null
          staff_count?: number | null
          status?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          city?: string
          compliance_rate?: number | null
          created_at?: string | null
          id?: string
          maintenance_load?: number | null
          manager_email?: string | null
          manager_name?: string
          name?: string
          portfolio_size?: number | null
          portfolio_value?: number | null
          postcode?: string
          revenue_monthly?: number | null
          staff_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_offices_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_permission_audit: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_permission_audit_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_permissions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      enterprise_role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "enterprise_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "enterprise_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_roles: {
        Row: {
          agency_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          is_template: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          is_template?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          is_template?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      enterprise_staff: {
        Row: {
          agency_id: string | null
          compliance_rate: number | null
          created_at: string | null
          email: string | null
          id: string
          maintenance_completed: number | null
          name: string
          office_id: string | null
          performance_score: number | null
          portfolio_size: number | null
          revenue_monthly: number | null
          role: string
          status: string | null
          tenant_satisfaction: number | null
        }
        Insert: {
          agency_id?: string | null
          compliance_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          maintenance_completed?: number | null
          name?: string
          office_id?: string | null
          performance_score?: number | null
          portfolio_size?: number | null
          revenue_monthly?: number | null
          role?: string
          status?: string | null
          tenant_satisfaction?: number | null
        }
        Update: {
          agency_id?: string | null
          compliance_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          maintenance_completed?: number | null
          name?: string
          office_id?: string | null
          performance_score?: number | null
          portfolio_size?: number | null
          revenue_monthly?: number | null
          role?: string
          status?: string | null
          tenant_satisfaction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_staff_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_staff_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "enterprise_offices"
            referencedColumns: ["id"]
          }
        ]
      }
      enterprise_user_roles: {
        Row: {
          agency_id: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          office_id: string | null
          profile_id: string
          role_id: string
        }
        Insert: {
          agency_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          office_id?: string | null
          profile_id: string
          role_id: string
        }
        Update: {
          agency_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          office_id?: string | null
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "enterprise_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      feature_usage: {
        Row: {
          account_id: string | null
          created_at: string | null
          feature_key: string
          id: string
          period_end: string | null
          period_start: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          feature_key?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          feature_key?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      franchise_offices: {
        Row: {
          assigned_at: string | null
          franchise_id: string
          id: string
          office_id: string
        }
        Insert: {
          assigned_at?: string | null
          franchise_id: string
          id?: string
          office_id: string
        }
        Update: {
          assigned_at?: string | null
          franchise_id?: string
          id?: string
          office_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_offices_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_offices_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          }
        ]
      }
      franchises: {
        Row: {
          account_id: string
          address: string | null
          brand_color: string | null
          brand_secondary_color: string | null
          created_at: string | null
          description: string | null
          email: string | null
          founded_date: string | null
          franchise_code: string
          franchise_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_id: string
          address?: string | null
          brand_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded_date?: string | null
          franchise_code?: string
          franchise_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_id?: string
          address?: string | null
          brand_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded_date?: string | null
          franchise_code?: string
          franchise_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      import_log: {
        Row: {
          created_at: string
          failed_rows: number
          filename: string
          id: string
          import_id: string
          imported_rows: number
          row_errors: Json | null
          status: string
          summary: Json | null
          total_rows: number
          updated_rows: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          failed_rows?: number
          filename?: string
          id?: string
          import_id?: string
          imported_rows?: number
          row_errors?: Json | null
          status?: string
          summary?: Json | null
          total_rows?: number
          updated_rows?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          failed_rows?: number
          filename?: string
          id?: string
          import_id?: string
          imported_rows?: number
          row_errors?: Json | null
          status?: string
          summary?: Json | null
          total_rows?: number
          updated_rows?: number
          user_id?: string | null
        }
        Relationships: []
      }
      inspection_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          inspection_id: string
          room_id: string | null
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          inspection_id: string
          room_id?: string | null
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          inspection_id?: string
          room_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "inspection_rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      inspection_rooms: {
        Row: {
          condition_rating: number | null
          created_at: string
          id: string
          inspection_id: string
          notes: string | null
          room_name: string
        }
        Insert: {
          condition_rating?: number | null
          created_at?: string
          id?: string
          inspection_id: string
          notes?: string | null
          room_name: string
        }
        Update: {
          condition_rating?: number | null
          created_at?: string
          id?: string
          inspection_id?: string
          notes?: string | null
          room_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_rooms_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          }
        ]
      }
      inspections: {
        Row: {
          completed_date: string | null
          created_at: string
          created_by: string | null
          id: string
          inspection_type: string
          inspector_name: string | null
          inspector_notes: string | null
          property_id: string
          report_url: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["inspection_status"]
          tenancy_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_type: string
          inspector_name?: string | null
          inspector_notes?: string | null
          property_id: string
          report_url?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["inspection_status"]
          tenancy_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_type?: string
          inspector_name?: string | null
          inspector_notes?: string | null
          property_id?: string
          report_url?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["inspection_status"]
          tenancy_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      jurisdiction_obligations: {
        Row: {
          applies: boolean
          conditions: Json
          effective_from: string | null
          effective_to: string | null
          id: string
          legal_basis: string | null
          nation: Database["public"]["Enums"]["nation"]
          obligation_code: string
          renewal_months: number | null
        }
        Insert: {
          applies: boolean
          conditions: Json
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          legal_basis?: string | null
          nation: Database["public"]["Enums"]["nation"]
          obligation_code: string
          renewal_months?: number | null
        }
        Update: {
          applies?: boolean
          conditions?: Json
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          legal_basis?: string | null
          nation?: Database["public"]["Enums"]["nation"]
          obligation_code?: string
          renewal_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisdiction_obligations_obligation_code_fkey"
            columns: ["obligation_code"]
            isOneToOne: false
            referencedRelation: "compliance_obligation_types"
            referencedColumns: ["code"]
          }
        ]
      }
      landlords: {
        Row: {
          company_number: string | null
          created_at: string
          decent_homes_compliant: boolean | null
          display_name: string
          email: string | null
          hhsrs_assessed: boolean | null
          hhsrs_date: string | null
          id: string
          import_id: string | null
          is_company: boolean
          managing_agency_id: string | null
          ombudsman_member: boolean | null
          ombudsman_ref: string | null
          owner_profile_id: string | null
          phone: string | null
          portfolio_type: string | null
        }
        Insert: {
          company_number?: string | null
          created_at?: string
          decent_homes_compliant?: boolean | null
          display_name: string
          email?: string | null
          hhsrs_assessed?: boolean | null
          hhsrs_date?: string | null
          id?: string
          import_id?: string | null
          is_company: boolean
          managing_agency_id?: string | null
          ombudsman_member?: boolean | null
          ombudsman_ref?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          portfolio_type?: string | null
        }
        Update: {
          company_number?: string | null
          created_at?: string
          decent_homes_compliant?: boolean | null
          display_name?: string
          email?: string | null
          hhsrs_assessed?: boolean | null
          hhsrs_date?: string | null
          id?: string
          import_id?: string | null
          is_company?: boolean
          managing_agency_id?: string | null
          ombudsman_member?: boolean | null
          ombudsman_ref?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          portfolio_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landlords_managing_agency_id_fkey"
            columns: ["managing_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landlords_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      maintenance_jobs: {
        Row: {
          assigned_contractor_profile_id: string | null
          created_at: string
          description: string | null
          id: string
          property_id: string
          status: string
          tenancy_id: string | null
          title: string
        }
        Insert: {
          assigned_contractor_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_id: string
          status?: string
          tenancy_id?: string | null
          title: string
        }
        Update: {
          assigned_contractor_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string
          status?: string
          tenancy_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_jobs_assigned_contractor_profile_id_fkey"
            columns: ["assigned_contractor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      marketplace_transactions: {
        Row: {
          actual_fee: number | null
          completed_at: string | null
          contractor_id: string | null
          created_at: string | null
          estimated_fee: number | null
          id: string
          job_id: string | null
          property_id: string | null
          quote_id: string | null
          referral_source: string | null
          service_type: string
          status: string
          transaction_type: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          actual_fee?: number | null
          completed_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          estimated_fee?: number | null
          id?: string
          job_id?: string | null
          property_id?: string | null
          quote_id?: string | null
          referral_source?: string | null
          service_type?: string
          status?: string
          transaction_type?: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          actual_fee?: number | null
          completed_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          estimated_fee?: number | null
          id?: string
          job_id?: string | null
          property_id?: string | null
          quote_id?: string | null
          referral_source?: string | null
          service_type?: string
          status?: string
          transaction_type?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_message_id: string | null
          property_id: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          property_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          property_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      modification_requests: {
        Row: {
          created_at: string
          decided_on: string | null
          description: string
          id: string
          modification_type: string
          refusal_reason: string | null
          status: string
          tenancy_id: string
        }
        Insert: {
          created_at?: string
          decided_on?: string | null
          description: string
          id?: string
          modification_type: string
          refusal_reason?: string | null
          status?: string
          tenancy_id: string
        }
        Update: {
          created_at?: string
          decided_on?: string | null
          description?: string
          id?: string
          modification_type?: string
          refusal_reason?: string | null
          status?: string
          tenancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modification_requests_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      n8n_agent_runs: {
        Row: {
          agent_id: string | null
          agent_key: string
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          output_summary: string | null
          raw_output: Json | null
          records_created: number | null
          records_found: number | null
          records_processed: number | null
          records_updated: number | null
          run_status: string
          started_at: string
        }
        Insert: {
          agent_id?: string | null
          agent_key?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          output_summary?: string | null
          raw_output?: Json | null
          records_created?: number | null
          records_found?: number | null
          records_processed?: number | null
          records_updated?: number | null
          run_status?: string
          started_at?: string
        }
        Update: {
          agent_id?: string | null
          agent_key?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          output_summary?: string | null
          raw_output?: Json | null
          records_created?: number | null
          records_found?: number | null
          records_processed?: number | null
          records_updated?: number | null
          run_status?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "n8n_agents"
            referencedColumns: ["id"]
          }
        ]
      }
      n8n_agents: {
        Row: {
          agency_id: string | null
          agent_group: string
          agent_key: string
          agent_name: string
          average_run_seconds: number | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          last_error_at: string | null
          last_error_message: string | null
          last_run_at: string | null
          last_success_at: string | null
          n8n_webhook_url: string | null
          n8n_workflow_id: string | null
          next_run_at: string | null
          records_processed: number
          status: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          agent_group?: string
          agent_key?: string
          agent_name?: string
          average_run_seconds?: number | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          n8n_webhook_url?: string | null
          n8n_workflow_id?: string | null
          next_run_at?: string | null
          records_processed?: number
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          agent_group?: string
          agent_key?: string
          agent_name?: string
          average_run_seconds?: number | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          n8n_webhook_url?: string | null
          n8n_workflow_id?: string | null
          next_run_at?: string | null
          records_processed?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_agents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_preferences: {
        Row: {
          compliance_expiry: boolean
          created_at: string
          document_uploaded: boolean
          email_enabled: boolean
          id: string
          inspection_completed: boolean
          inspection_scheduled: boolean
          maintenance_update: boolean
          portal_invite: boolean
          profile_id: string
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          quote_awaiting: boolean
          rent_overdue: boolean
          sms_enabled: boolean
          updated_at: string
        }
        Insert: {
          compliance_expiry?: boolean
          created_at?: string
          document_uploaded?: boolean
          email_enabled?: boolean
          id?: string
          inspection_completed?: boolean
          inspection_scheduled?: boolean
          maintenance_update?: boolean
          portal_invite?: boolean
          profile_id: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quote_awaiting?: boolean
          rent_overdue?: boolean
          sms_enabled?: boolean
          updated_at?: string
        }
        Update: {
          compliance_expiry?: boolean
          created_at?: string
          document_uploaded?: boolean
          email_enabled?: boolean
          id?: string
          inspection_completed?: boolean
          inspection_scheduled?: boolean
          maintenance_update?: boolean
          portal_invite?: boolean
          profile_id?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quote_awaiting?: boolean
          rent_overdue?: boolean
          sms_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          profile_id: string
          related_id: string | null
          related_table: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id: string
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id?: string
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      offices: {
        Row: {
          account_id: string | null
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          manager_id: string | null
          office_code: string
          office_name: string
          phone: string | null
          region_id: string | null
        }
        Insert: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          manager_id?: string | null
          office_code?: string
          office_name?: string
          phone?: string | null
          region_id?: string | null
        }
        Update: {
          account_id?: string | null
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          manager_id?: string | null
          office_code?: string
          office_name?: string
          phone?: string | null
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offices_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      }
      open_banking_connections: {
        Row: {
          account_name: string
          account_number_masked: string | null
          agency_id: string | null
          api_connected: boolean | null
          bank_name: string | null
          connection_metadata: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          last_sync: string | null
          provider: string
          provider_account_id: string | null
          sort_code: string | null
          sync_status: string
          updated_at: string | null
        }
        Insert: {
          account_name?: string
          account_number_masked?: string | null
          agency_id?: string | null
          api_connected?: boolean | null
          bank_name?: string | null
          connection_metadata?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          provider_account_id?: string | null
          sort_code?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number_masked?: string | null
          agency_id?: string | null
          api_connected?: boolean | null
          bank_name?: string | null
          connection_metadata?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          provider_account_id?: string | null
          sort_code?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_banking_connections_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      open_banking_transactions: {
        Row: {
          amount: number
          category: string | null
          connection_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          matched_rent_payment_id: string | null
          matched_status: string | null
          metadata: Json | null
          transaction_date: string
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          connection_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          matched_rent_payment_id?: string | null
          matched_status?: string | null
          metadata?: Json | null
          transaction_date: string
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          connection_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          matched_rent_payment_id?: string | null
          matched_status?: string | null
          metadata?: Json | null
          transaction_date?: string
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_banking_transactions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "open_banking_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_banking_transactions_matched_rent_payment_id_fkey"
            columns: ["matched_rent_payment_id"]
            isOneToOne: false
            referencedRelation: "rent_payments"
            referencedColumns: ["id"]
          }
        ]
      }
      owner_monthly_reports: {
        Row: {
          account_id: string | null
          created_at: string | null
          generated_at: string | null
          id: string
          owner_id: string
          pdf_url: string | null
          property_id: string
          report_data: Json | null
          report_month: number
          report_year: number
          sent_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          owner_id: string
          pdf_url?: string | null
          property_id: string
          report_data?: Json | null
          report_month: number
          report_year: number
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          owner_id?: string
          pdf_url?: string | null
          property_id?: string
          report_data?: Json | null
          report_month?: number
          report_year?: number
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      owner_portal_access: {
        Row: {
          access_code: string | null
          created_at: string
          id: string
          is_active: boolean
          landlord_id: string
          last_login: string | null
          profile_id: string | null
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          landlord_id: string
          last_login?: string | null
          profile_id?: string | null
        }
        Update: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          landlord_id?: string
          last_login?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_portal_access_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_portal_access_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pet_requests: {
        Row: {
          created_at: string
          decided_on: string | null
          description: string
          id: string
          refusal_reason: string | null
          status: Database["public"]["Enums"]["pet_request_status"]
          tenancy_id: string
        }
        Insert: {
          created_at?: string
          decided_on?: string | null
          description: string
          id?: string
          refusal_reason?: string | null
          status?: Database["public"]["Enums"]["pet_request_status"]
          tenancy_id: string
        }
        Update: {
          created_at?: string
          decided_on?: string | null
          description?: string
          id?: string
          refusal_reason?: string | null
          status?: Database["public"]["Enums"]["pet_request_status"]
          tenancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_requests_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_audit_log: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      portal_access: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          invite_expires_at: string | null
          invite_token_hash: string | null
          last_invite_sent_at: string | null
          property_id: string
          status: string
          updated_at: string
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          invite_expires_at?: string | null
          invite_token_hash?: string | null
          last_invite_sent_at?: string | null
          property_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
          user_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          invite_expires_at?: string | null
          invite_token_hash?: string | null
          last_invite_sent_at?: string | null
          property_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_access_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_access_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      portal_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_by: string | null
          portal_access_id: string | null
        }
        Insert: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          portal_access_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          portal_access_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_audit_log_portal_access_id_fkey"
            columns: ["portal_access_id"]
            isOneToOne: false
            referencedRelation: "portal_access"
            referencedColumns: ["id"]
          }
        ]
      }
      portal_invites: {
        Row: {
          accepted_at: string | null
          attempt_count: number | null
          created_at: string
          expires_at: string
          id: string
          portal_access_id: string
          revoked_at: string | null
          sent_at: string
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          attempt_count?: number | null
          created_at?: string
          expires_at: string
          id?: string
          portal_access_id: string
          revoked_at?: string | null
          sent_at: string
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          attempt_count?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          portal_access_id?: string
          revoked_at?: string | null
          sent_at?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_invites_portal_access_id_fkey"
            columns: ["portal_access_id"]
            isOneToOne: false
            referencedRelation: "portal_access"
            referencedColumns: ["id"]
          }
        ]
      }
      possession_case_grounds: {
        Row: {
          case_id: string
          ground_code: string
        }
        Insert: {
          case_id: string
          ground_code: string
        }
        Update: {
          case_id?: string
          ground_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "possession_case_grounds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "possession_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "possession_case_grounds_ground_code_fkey"
            columns: ["ground_code"]
            isOneToOne: false
            referencedRelation: "possession_grounds"
            referencedColumns: ["code"]
          }
        ]
      }
      possession_cases: {
        Row: {
          court_claim_on: string | null
          created_at: string
          id: string
          notice_served_on: string | null
          route: Database["public"]["Enums"]["possession_route"]
          status: Database["public"]["Enums"]["possession_case_status"]
          tenancy_id: string
        }
        Insert: {
          court_claim_on?: string | null
          created_at?: string
          id?: string
          notice_served_on?: string | null
          route: Database["public"]["Enums"]["possession_route"]
          status?: Database["public"]["Enums"]["possession_case_status"]
          tenancy_id: string
        }
        Update: {
          court_claim_on?: string | null
          created_at?: string
          id?: string
          notice_served_on?: string | null
          route?: Database["public"]["Enums"]["possession_route"]
          status?: Database["public"]["Enums"]["possession_case_status"]
          tenancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "possession_cases_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      possession_grounds: {
        Row: {
          code: string
          is_mandatory: boolean
          name: string
          nation: Database["public"]["Enums"]["nation"]
          notice_weeks: number | null
          requires_evidence: boolean
        }
        Insert: {
          code: string
          is_mandatory: boolean
          name: string
          nation: Database["public"]["Enums"]["nation"]
          notice_weeks?: number | null
          requires_evidence: boolean
        }
        Update: {
          code?: string
          is_mandatory?: boolean
          name?: string
          nation?: Database["public"]["Enums"]["nation"]
          notice_weeks?: number | null
          requires_evidence?: boolean
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          attempt_count: number
          created_at: string
          event_type: string
          id: number
          last_error: string | null
          processed_at: string
          status: string
          stripe_event_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: number
          last_error?: string | null
          processed_at?: string
          status?: string
          stripe_event_id?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: number
          last_error?: string | null
          processed_at?: string
          status?: string
          stripe_event_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          branch: string | null
          city: string | null
          co_alarm_checked: boolean | null
          council_tax_band: string | null
          created_at: string
          deposit_amount: number | null
          eicr_expiry: string | null
          epc_expiry: string | null
          epc_rating: string | null
          gas_safety_expiry: string | null
          has_garden: boolean | null
          has_parking: boolean | null
          how_to_rent_guide_given: boolean | null
          id: string
          import_id: string | null
          is_furnished: boolean
          is_hmo: boolean
          landlord_id: string
          line1: string
          line2: string | null
          managing_agency_id: string | null
          nation: Database["public"]["Enums"]["nation"]
          office_id: string | null
          postcode: string
          region: string | null
          rent_pcm: number | null
          right_to_rent_checked: boolean | null
          smoke_alarm_checked: boolean | null
          status: string | null
          type: string | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          branch?: string | null
          city?: string | null
          co_alarm_checked?: boolean | null
          council_tax_band?: string | null
          created_at?: string
          deposit_amount?: number | null
          eicr_expiry?: string | null
          epc_expiry?: string | null
          epc_rating?: string | null
          gas_safety_expiry?: string | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          how_to_rent_guide_given?: boolean | null
          id?: string
          import_id?: string | null
          is_furnished: boolean
          is_hmo: boolean
          landlord_id: string
          line1: string
          line2?: string | null
          managing_agency_id?: string | null
          nation: Database["public"]["Enums"]["nation"]
          office_id?: string | null
          postcode: string
          region?: string | null
          rent_pcm?: number | null
          right_to_rent_checked?: boolean | null
          smoke_alarm_checked?: boolean | null
          status?: string | null
          type?: string | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          branch?: string | null
          city?: string | null
          co_alarm_checked?: boolean | null
          council_tax_band?: string | null
          created_at?: string
          deposit_amount?: number | null
          eicr_expiry?: string | null
          epc_expiry?: string | null
          epc_rating?: string | null
          gas_safety_expiry?: string | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          how_to_rent_guide_given?: boolean | null
          id?: string
          import_id?: string | null
          is_furnished?: boolean
          is_hmo?: boolean
          landlord_id?: string
          line1?: string
          line2?: string | null
          managing_agency_id?: string | null
          nation?: Database["public"]["Enums"]["nation"]
          office_id?: string | null
          postcode?: string
          region?: string | null
          rent_pcm?: number | null
          right_to_rent_checked?: boolean | null
          smoke_alarm_checked?: boolean | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_managing_agency_id_fkey"
            columns: ["managing_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          }
        ]
      }
      property_compliance_items: {
        Row: {
          document_id: string | null
          exemption_ref: string | null
          id: string
          import_id: string | null
          last_completed: string | null
          next_due: string | null
          obligation_code: string
          property_id: string
          status: Database["public"]["Enums"]["compliance_status"]
          updated_at: string
        }
        Insert: {
          document_id?: string | null
          exemption_ref?: string | null
          id?: string
          import_id?: string | null
          last_completed?: string | null
          next_due?: string | null
          obligation_code: string
          property_id: string
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
        }
        Update: {
          document_id?: string | null
          exemption_ref?: string | null
          id?: string
          import_id?: string | null
          last_completed?: string | null
          next_due?: string | null
          obligation_code?: string
          property_id?: string
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_compliance_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_compliance_items_obligation_code_fkey"
            columns: ["obligation_code"]
            isOneToOne: false
            referencedRelation: "compliance_obligation_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "property_compliance_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      property_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_emergency_contact: boolean
          name: string
          notes: string | null
          phone: string | null
          property_id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          property_id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          property_id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      property_financials: {
        Row: {
          created_at: string
          current_value: number | null
          ground_rent: number | null
          id: string
          insurance_provider: string | null
          insurance_renewal: string | null
          mortgage_amount: number | null
          mortgage_end_date: string | null
          mortgage_lender: string | null
          mortgage_rate: number | null
          property_id: string
          purchase_price: number | null
          service_charge: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          ground_rent?: number | null
          id?: string
          insurance_provider?: string | null
          insurance_renewal?: string | null
          mortgage_amount?: number | null
          mortgage_end_date?: string | null
          mortgage_lender?: string | null
          mortgage_rate?: number | null
          property_id: string
          purchase_price?: number | null
          service_charge?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          ground_rent?: number | null
          id?: string
          insurance_provider?: string | null
          insurance_renewal?: string | null
          mortgage_amount?: number | null
          mortgage_end_date?: string | null
          mortgage_lender?: string | null
          mortgage_rate?: number | null
          property_id?: string
          purchase_price?: number | null
          service_charge?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_financials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      property_health_scores: {
        Row: {
          account_id: string | null
          calculated_at: string | null
          compliance_score: number
          created_at: string | null
          health_level: string
          id: string
          inspection_score: number
          maintenance_score: number
          overall_score: number
          portal_document_score: number
          property_id: string
          reasons: Json | null
          rent_score: number
          tenancy_score: number
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          calculated_at?: string | null
          compliance_score?: number
          created_at?: string | null
          health_level?: string
          id?: string
          inspection_score?: number
          maintenance_score?: number
          overall_score?: number
          portal_document_score?: number
          property_id: string
          reasons?: Json | null
          rent_score?: number
          tenancy_score?: number
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          calculated_at?: string | null
          compliance_score?: number
          created_at?: string | null
          health_level?: string
          id?: string
          inspection_score?: number
          maintenance_score?: number
          overall_score?: number
          portal_document_score?: number
          property_id?: string
          reasons?: Json | null
          rent_score?: number
          tenancy_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_health_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      prs_registrations: {
        Row: {
          created_at: string
          fee_paid: number | null
          id: string
          landlord_id: string
          property_id: string | null
          reference: string | null
          registered_on: string | null
          status: string
        }
        Insert: {
          created_at?: string
          fee_paid?: number | null
          id?: string
          landlord_id: string
          property_id?: string | null
          reference?: string | null
          registered_on?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          fee_paid?: number | null
          id?: string
          landlord_id?: string
          property_id?: string | null
          reference?: string | null
          registered_on?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prs_registrations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prs_registrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quote_id: string
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity: number
          quote_id: string
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quote_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          labour_cost: number | null
          maintenance_job_id: string
          materials_cost: number | null
          notes: string | null
          responded_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          labour_cost?: number | null
          maintenance_job_id: string
          materials_cost?: number | null
          notes?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          labour_cost?: number | null
          maintenance_job_id?: string
          materials_cost?: number | null
          notes?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_maintenance_job_id_fkey"
            columns: ["maintenance_job_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      regions: {
        Row: {
          account_id: string | null
          created_at: string | null
          description: string | null
          id: string
          region_code: string
          region_name: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          region_code?: string
          region_name?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          region_code?: string
          region_name?: string
        }
        Relationships: []
      }
      rent_increases: {
        Row: {
          created_at: string
          effective_from: string
          id: string
          new_amount: number
          notice_served_on: string
          old_amount: number
          tenancy_id: string
          tenant_challenged: boolean
        }
        Insert: {
          created_at?: string
          effective_from: string
          id?: string
          new_amount: number
          notice_served_on: string
          old_amount: number
          tenancy_id: string
          tenant_challenged: boolean
        }
        Update: {
          created_at?: string
          effective_from?: string
          id?: string
          new_amount?: number
          notice_served_on?: string
          old_amount?: number
          tenancy_id?: string
          tenant_challenged?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rent_increases_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      rent_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          late_fee: number | null
          method: string | null
          notes: string | null
          paid_date: string | null
          property_id: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenancy_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          late_fee?: number | null
          method?: string | null
          notes?: string | null
          paid_date?: string | null
          property_id: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenancy_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          late_fee?: number | null
          method?: string | null
          notes?: string | null
          paid_date?: string | null
          property_id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenancy_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      signatures: {
        Row: {
          created_at: string
          created_by: string | null
          document_name: string
          document_type: string
          expires_at: string | null
          id: string
          maintenance_job_id: string | null
          property_id: string | null
          signature_data: string | null
          signed_at: string | null
          signed_by: string | null
          status: string
          storage_path: string | null
          tenancy_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_name?: string
          document_type?: string
          expires_at?: string | null
          id?: string
          maintenance_job_id?: string | null
          property_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          storage_path?: string | null
          tenancy_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_name?: string
          document_type?: string
          expires_at?: string | null
          id?: string
          maintenance_job_id?: string | null
          property_id?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          storage_path?: string | null
          tenancy_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_maintenance_job_id_fkey"
            columns: ["maintenance_job_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          amount: number
          annual_price: number | null
          created_at: string
          currency: string
          features: Json | null
          has_advanced_analytics: boolean | null
          has_ai_assistant: boolean | null
          has_api_access: boolean | null
          has_basic_compliance: boolean | null
          has_bulk_operations: boolean | null
          has_contractor_panel: boolean | null
          has_financial_tracking: boolean | null
          has_full_compliance: boolean | null
          has_priority_support: boolean | null
          has_quote_workflow: boolean | null
          has_white_label_portal: boolean | null
          id: string
          interval: string
          is_active: boolean
          is_enterprise: boolean | null
          max_properties: number | null
          max_team_members: number | null
          monthly_price: number | null
          name: string
          slug: string | null
          storage_gb: number | null
          stripe_annual_price_id: string | null
          stripe_monthly_price_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          annual_price?: number | null
          created_at?: string
          currency?: string
          features?: Json | null
          has_advanced_analytics?: boolean | null
          has_ai_assistant?: boolean | null
          has_api_access?: boolean | null
          has_basic_compliance?: boolean | null
          has_bulk_operations?: boolean | null
          has_contractor_panel?: boolean | null
          has_financial_tracking?: boolean | null
          has_full_compliance?: boolean | null
          has_priority_support?: boolean | null
          has_quote_workflow?: boolean | null
          has_white_label_portal?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean
          is_enterprise?: boolean | null
          max_properties?: number | null
          max_team_members?: number | null
          monthly_price?: number | null
          name?: string
          slug?: string | null
          storage_gb?: number | null
          stripe_annual_price_id?: string | null
          stripe_monthly_price_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          annual_price?: number | null
          created_at?: string
          currency?: string
          features?: Json | null
          has_advanced_analytics?: boolean | null
          has_ai_assistant?: boolean | null
          has_api_access?: boolean | null
          has_basic_compliance?: boolean | null
          has_bulk_operations?: boolean | null
          has_contractor_panel?: boolean | null
          has_financial_tracking?: boolean | null
          has_full_compliance?: boolean | null
          has_priority_support?: boolean | null
          has_quote_workflow?: boolean | null
          has_white_label_portal?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean
          is_enterprise?: boolean | null
          max_properties?: number | null
          max_team_members?: number | null
          monthly_price?: number | null
          name?: string
          slug?: string | null
          storage_gb?: number | null
          stripe_annual_price_id?: string | null
          stripe_monthly_price_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      supa_admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          profile_id: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          profile_id?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          profile_id?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supa_admin_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tenancies: {
        Row: {
          assured_type: string | null
          created_at: string
          deposit_amount: number
          deposit_protected_on: string | null
          deposit_scheme: string | null
          end_date: string | null
          id: string
          import_id: string | null
          is_periodic: boolean | null
          last_rent_increase_date: string | null
          property_id: string
          regime: Database["public"]["Enums"]["tenancy_regime"]
          rent_amount: number
          rent_period: string
          start_date: string
          status: Database["public"]["Enums"]["tenancy_status"]
          term_type: Database["public"]["Enums"]["tenancy_term_type"]
        }
        Insert: {
          assured_type?: string | null
          created_at?: string
          deposit_amount: number
          deposit_protected_on?: string | null
          deposit_scheme?: string | null
          end_date?: string | null
          id?: string
          import_id?: string | null
          is_periodic?: boolean | null
          last_rent_increase_date?: string | null
          property_id: string
          regime: Database["public"]["Enums"]["tenancy_regime"]
          rent_amount: number
          rent_period: string
          start_date: string
          status?: Database["public"]["Enums"]["tenancy_status"]
          term_type: Database["public"]["Enums"]["tenancy_term_type"]
        }
        Update: {
          assured_type?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_protected_on?: string | null
          deposit_scheme?: string | null
          end_date?: string | null
          id?: string
          import_id?: string | null
          is_periodic?: boolean | null
          last_rent_increase_date?: string | null
          property_id?: string
          regime?: Database["public"]["Enums"]["tenancy_regime"]
          rent_amount?: number
          rent_period?: string
          start_date?: string
          status?: Database["public"]["Enums"]["tenancy_status"]
          term_type?: Database["public"]["Enums"]["tenancy_term_type"]
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      tenancy_parties: {
        Row: {
          import_id: string | null
          is_lead: boolean
          tenancy_id: string
          tenant_id: string
        }
        Insert: {
          import_id?: string | null
          is_lead: boolean
          tenancy_id: string
          tenant_id: string
        }
        Update: {
          import_id?: string | null
          is_lead?: boolean
          tenancy_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenancy_parties_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancy_parties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_complaints: {
        Row: {
          created_at: string | null
          description: string
          filed_on: string | null
          id: string
          outcome: string | null
          property_id: string | null
          resolved_on: string | null
          status: string
          tenancy_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          filed_on?: string | null
          id?: string
          outcome?: string | null
          property_id?: string | null
          resolved_on?: string | null
          status?: string
          tenancy_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          filed_on?: string | null
          id?: string
          outcome?: string | null
          property_id?: string | null
          resolved_on?: string | null
          status?: string
          tenancy_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_complaints_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_portal_access: {
        Row: {
          access_code: string | null
          created_at: string
          id: string
          is_active: boolean
          last_login: string | null
          profile_id: string | null
          tenant_id: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          profile_id?: string | null
          tenant_id: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          profile_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_portal_access_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_portal_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          full_name: string
          id: string
          import_id: string | null
          phone: string | null
          profile_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name: string
          id?: string
          import_id?: string | null
          phone?: string | null
          profile_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          id?: string
          import_id?: string | null
          phone?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      webhook_endpoints: {
        Row: {
          agency_id: string | null
          created_at: string
          events: Json
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          secret_hash: string | null
          url: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          secret_hash?: string | null
          url?: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          secret_hash?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      workspace_connections: {
        Row: {
          account_email: string | null
          account_name: string
          agency_id: string | null
          api_connected: boolean
          created_at: string
          error_message: string | null
          id: string
          last_sync: string | null
          provider: string
          sync_config: Json | null
          sync_status: string
          updated_at: string
        }
        Insert: {
          account_email?: string | null
          account_name?: string
          agency_id?: string | null
          api_connected?: boolean
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          sync_config?: Json | null
          sync_status?: string
          updated_at?: string
        }
        Update: {
          account_email?: string | null
          account_name?: string
          agency_id?: string | null
          api_connected?: boolean
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          sync_config?: Json | null
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_connections_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      workspace_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string
          details: string | null
          error_message: string | null
          id: string
          provider: string
          records_synced: number
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string
          details?: string | null
          error_message?: string | null
          id?: string
          provider?: string
          records_synced?: number
          started_at?: string
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          details?: string | null
          error_message?: string | null
          id?: string
          provider?: string
          records_synced?: number
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "workspace_connections"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      v_arrears_summary: {
        Row: {
          created_at: string | null
          id: string | null
          last_contact: string | null
          payment_plan_amount: number | null
          payment_plan_frequency: string | null
          property_postcode: string | null
          status: Database["public"]["Enums"]["arrear_status"] | null
          tenancy_id: string | null
          tenant_id: string | null
          tenant_name: string | null
          total_owed: number | null
        }
        Relationships: []
      }
      v_compliance_dashboard: {
        Row: {
          id: string | null
          nation: Database["public"]["Enums"]["nation"] | null
          next_due: string | null
          obligation: string | null
          postcode: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["compliance_status"] | null
          urgency: string | null
        }
        Relationships: []
      }
      v_contractor_performance: {
        Row: {
          active_jobs: number | null
          avg_quote_value: number | null
          business_name: string | null
          completed_jobs: number | null
          id: string | null
          rating: number | null
          status: Database["public"]["Enums"]["contractor_status"] | null
          trade: string | null
        }
        Relationships: []
      }
      v_dashboard_kpi: {
        Row: {
          active_arrears: number | null
          active_contractors: number | null
          active_tenancies: number | null
          open_maintenance: number | null
          overdue_payments: number | null
          total_arrears_value: number | null
          total_properties: number | null
          upcoming_inspections: number | null
        }
        Relationships: []
      }
      v_epc_below_c: {
        Row: {
          epc_expiry: string | null
          epc_rating: string | null
          nation: Database["public"]["Enums"]["nation"] | null
          postcode: string | null
          property_id: string | null
        }
        Relationships: []
      }
      v_inspection_schedule: {
        Row: {
          id: string | null
          inspection_type: string | null
          inspector_name: string | null
          postcode: string | null
          property_id: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["inspection_status"] | null
          tenancy_id: string | null
          title: string | null
        }
        Relationships: []
      }
      v_rent_collection: {
        Row: {
          collected: number | null
          overdue_amount: number | null
          overdue_count: number | null
          postcode: string | null
          property_id: string | null
          rent_amount: number | null
          rent_period: string | null
          tenancy_id: string | null
          total_payments: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_create_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_create_portal_invite: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_create_property: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_manage_landlord: {
        Args: { l_id: string }
        Returns: boolean
      }
      can_manage_property: {
        Args: { p_id: string }
        Returns: boolean
      }
      can_manage_tenancy: {
        Args: { t_id: string }
        Returns: boolean
      }
      can_run_inspection: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_upload_document: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      count_user_properties: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_plan_slug: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_account_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          permission_code: string
        }[]
      }
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          agency_id: string | null
          office_id: string | null
          role_name: string
          role_slug: string
        }[]
      }
      has_permission: {
        Args: { perm_code: string }
        Returns: boolean
      }
      is_account_read_only: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_assigned_contractor: {
        Args: { p_id: string }
        Returns: boolean
      }
      is_contractor_of_job: {
        Args: { j_id: string }
        Returns: boolean
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_subscription_active_or_trialing: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tenant_of_property: {
        Args: { p_id: string }
        Returns: boolean
      }
      is_tenant_of_tenancy: {
        Args: { t_id: string }
        Returns: boolean
      }
      my_agency_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      supa_admin_authenticate: {
        Args: { input_password: string }
        Returns: Json
      }
      supa_admin_change_password: {
        Args: { current_password: string; input_token: string; new_password: string }
        Returns: Json
      }
      supa_admin_get_dashboard_data: {
        Args: { input_token: string }
        Returns: Json
      }
      supa_admin_get_table_counts: {
        Args: { input_token: string }
        Returns: Json
      }
      supa_admin_logout: {
        Args: { input_token: string }
        Returns: Json
      }
      supa_admin_toggle_suspend: {
        Args: { input_token: string; target_user_id: string }
        Returns: Json
      }
      supa_admin_update_setting: {
        Args: { input_token: string; setting_key: string; setting_value: string }
        Returns: Json
      }
      supa_admin_verify_session: {
        Args: { input_token: string }
        Returns: Json
      }
    }
    Enums: {
      arrear_status: "active" | "resolved" | "payment_plan" | "legal_proceedings"
      compliance_status:
        | "compliant"
        | "due_soon"
        | "overdue"
        | "missing"
        | "not_applicable"
        | "exempt"
      contractor_job_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      contractor_status: "active" | "inactive" | "suspended"
      document_kind:
        | "gas_safety"
        | "eicr"
        | "epc"
        | "pat"
        | "legionella_risk_assessment"
        | "right_to_rent"
        | "deposit_prescribed_info"
        | "how_to_rent_guide"
        | "rra_information_sheet"
        | "hmo_licence"
        | "selective_licence"
        | "tenancy_agreement"
        | "inventory"
        | "epc_exemption"
        | "insurance"
        | "other"
      inspection_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      message_status: "unread" | "read" | "archived"
      nation: "england" | "wales" | "scotland" | "northern_ireland"
      payment_status: "pending" | "paid" | "overdue" | "partial" | "failed" | "refunded"
      pet_request_status: "requested" | "approved" | "refused" | "withdrawn"
      possession_case_status:
        | "draft"
        | "notice_served"
        | "court_application"
        | "order_granted"
        | "withdrawn"
        | "completed"
      possession_route:
        | "section_8"
        | "wales_notice"
        | "scotland_notice_to_leave"
        | "ni_notice"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing" | "unpaid"
      tenancy_regime:
        | "ast_legacy"
        | "assured_periodic_rra"
        | "occupation_contract_wales"
        | "prt_scotland"
        | "ni_private_tenancy"
      tenancy_status: "draft" | "active" | "ended" | "in_possession_process"
      tenancy_term_type: "periodic" | "fixed_term"
      user_role:
        | "platform_admin"
        | "estate_agent_admin"
        | "estate_agent_staff"
        | "landlord"
        | "tenant"
        | "contractor"
        | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
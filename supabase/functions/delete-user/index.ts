import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        // Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify the user is authenticated
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Invalid token or user not found')
        }

        // Check if the user is an admin
        const { data: roles, error: rolesError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle()

        if (rolesError || !roles) {
            console.error('Role check error:', rolesError)
            throw new Error('Unauthorized: only admins can delete users')
        }

        // Parse the request body
        const { user_id } = await req.json()
        if (!user_id) {
            throw new Error('User ID is required')
        }

        // Create a Supabase client with the SERVICE_ROLE_KEY to perform admin actions
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // Delete the user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user_id
        )

        if (deleteError) {
            console.error('Delete user error:', deleteError)
            throw deleteError
        }

        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error processing request:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Return 400 for bad requests (client errors)
            }
        )
    }
})

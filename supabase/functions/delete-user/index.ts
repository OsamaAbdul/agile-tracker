// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }


// Deno.serve(async (req: Request) => {
//     // Handle CORS preflight requests
//     if (req.method === 'OPTIONS') {
//         return new Response('ok', { headers: corsHeaders })
//     }

//     try {
//         // Get the Authorization header from the request
//         const authHeader = req.headers.get('Authorization')
//         if (!authHeader) {
//             throw new Error('Missing Authorization header')
//         }

//         // Create a Supabase client with the Auth context of the logged in user
//         const supabaseClient = createClient(
//             Deno.env.get('SUPABASE_URL') ?? '',
//             Deno.env.get('SUPABASE_ANON_KEY') ?? '',
//             { global: { headers: { Authorization: authHeader } } }
//         )

//         // Verify the user is authenticated
//         const {
//             data: { user },
//             error: userError,
//         } = await supabaseClient.auth.getUser()

//         if (userError || !user) {
//             throw new Error('Invalid token or user not found')
//         }

//         // Check if the user is an admin
//         const { data: roles, error: rolesError } = await supabaseClient
//             .from('user_roles')
//             .select('role')
//             .eq('user_id', user.id)
//             .eq('role', 'admin')
//             .maybeSingle()

//         if (rolesError || !roles) {
//             console.error('Role check error:', rolesError)
//             throw new Error('Unauthorized: only admins can delete users')
//         }

//         // Parse the request body
//         const { user_id } = await req.json()
//         if (!user_id) {
//             throw new Error('User ID is required')
//         }

//         // Create a Supabase client with the SERVICE_ROLE_KEY to perform admin actions
//         const supabaseAdmin = createClient(
//             Deno.env.get('SUPABASE_URL') ?? '',
//             Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
//             {
//                 auth: {
//                     autoRefreshToken: false,
//                     persistSession: false,
//                 },
//             }
//         )

//         // Delete the user
//         const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
//             user_id
//         )

//         if (deleteError) {
//             console.error('Delete user error:', deleteError)
//             throw deleteError
//         }

//         return new Response(
//             JSON.stringify({ message: 'User deleted successfully' }),
//             {
//                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//                 status: 200,
//             }
//         )
//     } catch (error) {
//         console.error('Error processing request:', error)
//         return new Response(
//             JSON.stringify({ error: error.message }),
//             {
//                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//                 status: 400, // Return 400 for bad requests (client errors)
//             }
//         )
//     }
// })


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    /* ----------------------------- */
    /* CORS preflight                */
    /* ----------------------------- */
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }

    try {
        /* ----------------------------- */
        /* 1️⃣ Validate Authorization    */
        /* ----------------------------- */
        const authHeader = req.headers.get('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Missing or invalid Authorization header' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        /* ----------------------------- */
        /* 2️⃣ User-context client       */
        /* ----------------------------- */
        const token = authHeader.replace(/^Bearer\s+/i, '')

        const supabaseUser = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            {
                global: {
                    headers: {
                        Authorization: authHeader,
                    },
                },
                auth: {
                    persistSession: false, // Critical for Edge Functions
                }
            }
        )

        // Pass the token explicitly to getUser to avoid "Auth session missing!"
        const {
            data: { user },
            error: userError,
        } = await supabaseUser.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth error:', userError)
            return new Response(
                JSON.stringify({
                    error: 'Invalid or expired token',
                    details: userError?.message,
                    auth_header_len: authHeader?.length
                }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        /* ----------------------------- */
        /* 3️⃣ Admin authorization      */
        /* ----------------------------- */
        const { data: role, error: roleError } = await supabaseUser
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle()

        if (roleError || !role) {
            return new Response(
                JSON.stringify({ error: 'Forbidden: admin access only' }),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        /* ----------------------------- */
        /* 4️⃣ Parse & validate body     */
        /* ----------------------------- */
        let body: { user_id?: string }

        try {
            body = await req.json()
        } catch {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        if (!body.user_id) {
            return new Response(
                JSON.stringify({ error: 'user_id is required' }),
                {
                    status: 422,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        /* ----------------------------- */
        /* 5️⃣ Admin Supabase client     */
        /* ----------------------------- */
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        const { error: deleteError } =
            await supabaseAdmin.auth.admin.deleteUser(body.user_id)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return new Response(
                JSON.stringify({ error: 'Failed to delete user' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        /* ----------------------------- */
        /* 6️⃣ Success response          */
        /* ----------------------------- */
        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    } catch (err) {
        console.error('Unhandled error:', err)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})

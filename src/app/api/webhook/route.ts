import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Wir brauchen den Service Role Key, um Guthaben zu ändern (Admin-Rechte)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.formData(); // Digistore sendet oft als Form-Data
    const event = body.get('event');
    const email = body.get('email');
    const product_id = body.get('product_id');

    // Nur wenn es ein Kauf (on_payment) ist
    if (event === 'on_payment' || event === 'on_test_payment') {
      
      // Logik: Welches Produkt gibt wie viele Credits?
      let creditsToAdd = 0;
      if (product_id === '567890') creditsToAdd = 10; // Beispiel ID für "Basis"
      if (product_id === '567891') creditsToAdd = 50; // Beispiel ID für "Pro"

      // 1. User in der DB finden
      const { data: userSub } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id, analyses_left')
        .eq('email', email)
        .single();

      if (userSub) {
        // 2. Credits aufbuchen
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ 
            analyses_left: userSub.analyses_left + creditsToAdd,
            plan_type: 'premium'
          })
          .eq('id', userSub.id);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

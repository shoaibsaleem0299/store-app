require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: process.env.DIRECT_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    const sql = `
-- Ensure the storage bucket exists
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

-- Enable RLS (skipped, since it's already enabled by default and might throw ownership error)

-- Drop existing to avoid conflicts
drop policy if exists "Allow public read access to uploads bucket" on storage.objects;
drop policy if exists "Allow public insert to uploads bucket" on storage.objects;
drop policy if exists "Allow public update to uploads bucket" on storage.objects;
drop policy if exists "Allow public delete from uploads bucket" on storage.objects;

-- Policy to allow public reads from the uploads bucket
create policy "Allow public read access to uploads bucket" 
on storage.objects for select 
using ( bucket_id = 'uploads' );

-- Policy to allow public inserts into the uploads bucket
create policy "Allow public insert to uploads bucket" 
on storage.objects for insert 
with check ( bucket_id = 'uploads' );

-- Policy to allow public updates to the uploads bucket
create policy "Allow public update to uploads bucket" 
on storage.objects for update 
using ( bucket_id = 'uploads' ) 
with check ( bucket_id = 'uploads' );

-- Policy to allow public deletes from the uploads bucket
create policy "Allow public delete from uploads bucket" 
on storage.objects for delete 
using ( bucket_id = 'uploads' );
    `;

    await client.query(sql);
    console.log("Storage policies applied successfully.");
  } catch (err) {
    console.error("Error applying storage policies:", err);
  } finally {
    await client.end();
  }
}

run();

-- Ensure the storage bucket exists
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Enable RLS (usually it's already enabled for storage.objects by default, but just in case)
alter table storage.objects enable row level security;

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


-- Add nickname column to the profiles table
ALTER TABLE public.profiles ADD COLUMN nickname text;

-- Update the handle_new_user function to include nickname from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, nickname, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'nickname',
    now(), 
    now()
  );
  RETURN new;
END;
$function$;

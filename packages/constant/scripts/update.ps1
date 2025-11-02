$base = $args[0]

if (!$base) {
    Write-Error "Missing base path. Usage: ./update.ps1 path/to/dumpostor/files"
    exit
}

node enum (Join-Path $base "enums\TaskTypes.json") TaskType > ../lib/generated/TaskType.ts
node enum (Join-Path $base "enums\SystemTypes.json") SystemType > ../lib/generated/SystemType.ts
node enum (Join-Path $base "enums\StringNames.json") StringName > ../lib/generated/StringName.ts

node cosmetics (Join-Path $base "cosmetics.json")
Copy-Item cosmetics/* ../lib/generated/cosmetics

node maps (Join-Path $base "maps")
Copy-Item maps/* ../lib/generated/maps

node mixup (Join-Path $base "maps\Fungle\mixup.json") > ../lib/generated/mushroomMixupCosmetics.ts
export interface Team {
    name: string;
    members: { userId: string; role: string, username : string}[];  // Array of member objects with userId and role
    joinCode: string;
}
{ pkgs ? import <nixpkgs> {}}:
with pkgs;
let
  my-ghc = haskellPackages.ghcWithPackages (h: [ h.cassava h.microlens h.microlens-th ]);
in
mkShell {
  buildInputs = [ my-ghc ];
}

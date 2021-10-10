{-# LANGUAGE LambdaCase #-}

module Main where

import Control.Monad
import qualified Data.ByteString.Lazy as BL
import Data.Csv
import Data.Foldable
import qualified Data.List as L
import qualified Data.Map as M
import Data.Ord
import qualified Data.Text as T
import Data.Vector (Vector)
import qualified Data.Vector as V
import Lens.Micro
import Types

truncate' :: Double -> Int -> Double
truncate' x n = fromIntegral (floor (x * t)) / t
  where
    t = 10 ^ n

weightedSum :: ScoreRow -> Int
weightedSum x = foldl' (\res s -> (+) (x ^. s) . res) (0 +) selectors 0
  where
    selectors = [technicalAbility, utility, creativity, presentation, impression]

getData s = do
  f <- BL.readFile s
  case decode HasHeader f of
    Right l -> pure l
    Left err -> error err

ins (table, score) = M.insertWith (\(a, b) (c, d) -> (a + c, b + d)) table (score, 1)

main = do
  dat <- getData "data.csv"
  let g x = (x ^. projectName, weightedSum x)
  putStrLn $ "Table" <> replicate 25 ' ' <> "Average Score"
  putStrLn $ replicate 50 '-'
  let res = foldl' (flip (ins . g)) M.empty dat
  let h (t, (s, c)) = (t, fromIntegral s / fromIntegral c)
  let f (a, b) = putStrLn (T.unpack a <> replicate (30 - T.length a) ' ' <> show (truncate' b 3))
  mapM_ f (L.take 20 (L.sortOn (Down . snd) (h <$> M.toList res)))
